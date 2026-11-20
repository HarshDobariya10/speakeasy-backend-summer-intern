import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminRegisterDto } from './dto/register.dto';
import { AdminLoginDto } from './dto/login.dto';
import { AdminRefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from 'src/shared/decorators/public.decorator';
import { GetAdmin } from 'src/shared/decorators/get-admin.decorator';
import type { AdminSessionType } from 'src/shared/types/admin-session.type';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@ApiTags('Authentication')
@Controller('admin/auth')
@UseGuards(AdminAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new admin' })
  async register(@Body() registerDto: AdminRegisterDto, @Req() request: any) {
    return this.authService.register(registerDto, request);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login admin' })
  async login(@Body() loginDto: AdminLoginDto, @Req() request: any) {
    return this.authService.login(loginDto, request);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout admin' })
  async logout(@GetAdmin() sessionData: AdminSessionType) {
    return this.authService.logout(sessionData);
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() refreshTokenDto: AdminRefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  // FIX: was @Post — profile is a read operation, must be @Get
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get admin profile' })
  async getProfile(@GetAdmin() sessionData: AdminSessionType) {
    return { admin: sessionData.admin };
  }
}