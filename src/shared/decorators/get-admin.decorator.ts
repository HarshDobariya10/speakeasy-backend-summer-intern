import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminSessionType } from '../types/admin-session.type';

export const GetAdmin = createParamDecorator(
  (data: any, ctx: ExecutionContext): AdminSessionType => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
