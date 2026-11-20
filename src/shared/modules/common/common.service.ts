import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';
import * as requestIp from 'request-ip';
import * as geoIp from 'geoip-lite';

@Injectable()
export class CommonService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateOtp(): { otp: string; otpRef: string; expireAt: Date } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpRef = Math.random().toString(36).substring(2, 15);
    const expireAt = DateTime.utc().plus({ minutes: 10 }).toJSDate();

    return { otp, otpRef, expireAt };
  }

  getCurrentTimestamp(): string {
    return DateTime.utc().toISO();
  }

  getClientInfo(request: any): {
    ipAddress: string | null;
    userAgent: string | null;
    geoLocation: any;
  } {
    const clientIp = requestIp.getClientIp(request);
    const geoLocation = geoIp.lookup(clientIp as string);
    const userAgent = request.headers['user-agent'];

    return {
      ipAddress: clientIp,
      userAgent,
      geoLocation,
    };
  }
}
