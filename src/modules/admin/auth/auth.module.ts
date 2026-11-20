import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { AdminCoreModule } from 'src/core/admin-core/admin-core.module';
import { AdminCredentialCoreModule } from 'src/core/admin-credential-core/admin-credential-core.module';
import { AdminSessionCoreModule } from 'src/core/admin-session-core/admin-session-core.module';
import { CommonModule } from 'src/shared/modules/common/common.module';
import { jwtAuthConstants } from 'src/shared/keys/auth.keys';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtAuthConstants.accessTokenSecret,
      signOptions: { expiresIn: jwtAuthConstants.accessTokenExpiresIn },
    }),
    AdminCoreModule,
    AdminCredentialCoreModule,
    AdminSessionCoreModule,
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminJwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
