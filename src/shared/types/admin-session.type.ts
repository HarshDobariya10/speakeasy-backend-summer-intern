import { Admin, AdminSession } from '@prisma/client';

export type AdminSessionType = {
  admin: Admin;
  session: AdminSession;
};
