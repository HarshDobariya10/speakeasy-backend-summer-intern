import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminCoreService } from 'src/core/admin-core/admin-core.service';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { jwtAuthConstants, TOKEN_USER_TYPE } from 'src/shared/keys/auth.keys';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly adminCoreService: AdminCoreService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtAuthConstants.accessTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request & { headers: { authorization: string } },
    payload: {
      id: string;
      email: string;
      userType: TOKEN_USER_TYPE;
    },
  ) {
    if (payload.userType !== TOKEN_USER_TYPE.ADMIN) {
      throw new UnauthorizedException('Invalid token: not an admin token');
    }

    // FIX: use findFirst (not findUnique) so isDeleted can be filtered here too,
    // giving an earlier rejection before performJWTStrategy is called.
    const admin = await this.adminCoreService
      .findFirst({ where: { id: payload.id, isDeleted: false } })
      .catch(() => null);

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    // FIX: pass the real admin object — no unsafe `as Admin` cast needed anymore
    return this.authService.performJWTStrategy({
      request: request as any,
      admin,
    });
  }
}