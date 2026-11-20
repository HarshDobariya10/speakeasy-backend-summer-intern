import { JwtVerifyOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';

export enum TOKEN_TYPE {
  REFRESH = 'REFRESH',
  ACCESS = 'ACCESS',
}

export enum TOKEN_USER_TYPE {
  ADMIN = 'ADMIN',
}

export const jwtAuthConstants = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
  refreshTokenSecret:
    process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  accessTokenExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ||
    '24h') as StringValue,
  refreshTokenExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
    '7d') as StringValue,
};

export const refreshTokenSignSettings = {
  secret: jwtAuthConstants.refreshTokenSecret,
  expiresIn: jwtAuthConstants.refreshTokenExpiresIn,
};

export const accessTokenSignSettings = {
  secret: jwtAuthConstants.accessTokenSecret,
  expiresIn: jwtAuthConstants.accessTokenExpiresIn,
};

export const accessTokenVerifySettings: JwtVerifyOptions = {
  secret: jwtAuthConstants.accessTokenSecret,
};

export const refreshTokenVerifySettings: JwtVerifyOptions = {
  secret: jwtAuthConstants.refreshTokenSecret,
};

export const AuthMessages = {
  ACCESS_TOKEN_VALID: 'Access token is already valid.',
  REFRESH_TOKEN_INVALID: 'Refresh token is expired.',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
};
