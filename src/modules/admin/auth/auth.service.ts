import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '@prisma/client';
import { AdminCoreService } from 'src/core/admin-core/admin-core.service';
import { AdminCredentialCoreService } from 'src/core/admin-credential-core/admin-credential-core.service';
import { AdminSessionCoreService } from 'src/core/admin-session-core/admin-session-core.service';
import { CommonService } from 'src/shared/modules/common/common.service';
import { AdminRegisterDto } from './dto/register.dto';
import { AdminLoginDto } from './dto/login.dto';
import { AdminRefreshTokenDto } from './dto/refresh-token.dto';
import { AdminSessionType } from 'src/shared/types/admin-session.type';
import {
  accessTokenSignSettings,
  refreshTokenSignSettings,
  refreshTokenVerifySettings,
  TOKEN_TYPE,
  TOKEN_USER_TYPE,
  AuthMessages,
} from 'src/shared/keys/auth.keys';
import { STATUS_ENUM } from 'src/keys';

// FIX: Omit sensitive fields before returning admin objects to the client.
// The raw Prisma Admin type does NOT include password (it lives in AdminCredential),
// but isDeleted / internal timestamps should still be stripped.
type SafeAdmin = Omit<Admin, 'isDeleted' | 'createdAt' | 'updatedAt'>;

function sanitizeAdmin(admin: Admin): SafeAdmin {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isDeleted, createdAt, updatedAt, ...safe } = admin as any;
  return safe;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminCoreService: AdminCoreService,
    private readonly adminCredentialCoreService: AdminCredentialCoreService,
    private readonly adminSessionCoreService: AdminSessionCoreService,
    private readonly commonService: CommonService,
  ) {}

  async register(
    registerDto: AdminRegisterDto,
    request: any,
  ): Promise<{
    admin: SafeAdmin;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password, firstName, lastName, phone, code } = registerDto;

    const existingAdmin = await this.adminCoreService
      .findFirst({ where: { email, isDeleted: false } })
      .catch(() => null);

    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    const hashedPassword = await this.commonService.hashPassword(password);

    const admin = await this.adminCoreService.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        code,
        firstNameLastName: `${firstName || ''} ${lastName || ''}`.trim(),
        lastNameFirstName: `${lastName || ''} ${firstName || ''}`.trim(),
        status: STATUS_ENUM.ENABLED,
      },
    });

    await this.adminCredentialCoreService.create({
      data: {
        adminId: admin.id,
        password: hashedPassword,
      },
    });

    const { accessToken, refreshToken } = await this.getNewToken(admin);
    const clientInfo = this.commonService.getClientInfo(request);

    await this.adminSessionCoreService.create({
      data: {
        adminId: admin.id,
        accessToken,
        refreshToken,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        geoIpCountry: clientInfo.geoLocation?.country || '',
        loginAt: new Date(),
      },
    });

    // FIX: return sanitized admin — never expose internal flags to clients
    return { admin: sanitizeAdmin(admin), accessToken, refreshToken };
  }

  async login(
    loginDto: AdminLoginDto,
    request: any,
  ): Promise<{
    admin: SafeAdmin;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = loginDto;

    const admin = await this.adminCoreService
      .findFirst({ where: { email, isDeleted: false } })
      .catch(() => null);

    // FIX: keep both branches identical to prevent user enumeration attacks
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const credential = await this.adminCredentialCoreService
      .findFirst({ where: { adminId: admin.id, isDeleted: false } })
      .catch(() => null);

    if (!credential) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.commonService.comparePassword(
      password,
      credential.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.getNewToken(admin);
    const clientInfo = this.commonService.getClientInfo(request);

    await this.adminSessionCoreService.create({
      data: {
        adminId: admin.id,
        accessToken,
        refreshToken,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        geoIpCountry: clientInfo.geoLocation?.country || '',
        loginAt: new Date(),
      },
    });

    await this.adminCoreService.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    // FIX: sanitize before returning
    return { admin: sanitizeAdmin(admin), accessToken, refreshToken };
  }

  async logout(sessionData: AdminSessionType): Promise<{ message: string }> {
    const { session } = sessionData;

    // FIX: guard against double-logout — session is already invalidated
    if (session.logoutAt) {
      throw new BadRequestException('Session already logged out');
    }

    await this.adminSessionCoreService.update({
      where: { id: session.id },
      data: { logoutAt: new Date() },
    });

    return { message: AuthMessages.LOGOUT_SUCCESS };
  }

  async refreshToken(refreshTokenDto: AdminRefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { refreshToken } = refreshTokenDto;

    let validateRefreshToken: any = null;

    try {
      validateRefreshToken = await this.jwtService.verifyAsync(
        refreshToken,
        refreshTokenVerifySettings,
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (validateRefreshToken.userType !== TOKEN_USER_TYPE.ADMIN) {
      throw new UnauthorizedException('Invalid token type');
    }

    // FIX: findUnique does NOT accept arbitrary where filters beyond unique fields.
    // Use findFirst so we can add isDeleted to the filter safely.
    const admin = await this.adminCoreService
      .findFirst({ where: { id: validateRefreshToken.id, isDeleted: false } })
      .catch(() => null);

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    // FIX: verify the refresh token is still in an active (non-logged-out) session
    const existingSession = await this.adminSessionCoreService
      .findFirst({
        where: {
          adminId: admin.id,
          refreshToken,
          isDeleted: false,
          logoutAt: null, // session must not have been logged out
        },
      })
      .catch(() => null);

    if (!existingSession) {
      throw new UnauthorizedException(
        'Refresh token is invalid or session has been terminated',
      );
    }

    const newTokens = await this.getNewToken(admin);

    // Rotate: update the existing session row with the new token pair
    await this.adminSessionCoreService.update({
      where: { id: existingSession.id },
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      },
    });

    return newTokens;
  }

  private async getNewToken(admin: Admin): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = {
      id: admin.id,
      email: admin.email,
      userType: TOKEN_USER_TYPE.ADMIN,
    };

    const accessToken = await this.jwtService.signAsync(
      { ...payload, type: TOKEN_TYPE.ACCESS },
      accessTokenSignSettings,
    );

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: TOKEN_TYPE.REFRESH },
      refreshTokenSignSettings,
    );

    return { accessToken, refreshToken };
  }

  async performJWTStrategy({
    request,
    admin,
  }: {
    request: Request & { headers: { authorization: string } };
    admin: Admin;
  }): Promise<AdminSessionType> {
    const accessToken = request.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      throw new UnauthorizedException('Invalid token');
    }

    const fullAdmin = await this.adminCoreService.findUnique({
      where: { id: admin.id },
    });

    if (!fullAdmin || fullAdmin.isDeleted) {
      throw new UnauthorizedException('Admin not found');
    }

    // FIX: also check logoutAt — a logged-out session's access token must be rejected
    const session = await this.adminSessionCoreService.findFirst({
      where: {
        adminId: admin.id,
        accessToken,
        isDeleted: false,
        logoutAt: null,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or has been terminated');
    }

    return { admin: fullAdmin, session };
  }
}