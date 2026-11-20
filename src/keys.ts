export const MAX_FIND_ALL_LIMIT = 50;

export enum STATUS_ENUM {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
  INVITED = 'INVITED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export enum UNIQUE_ID_ENUM {
  Admin = 'ADMIN',
}

export const COMMON_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials provided',
  ADMIN_NOT_FOUND: 'Admin not found',
  ADMIN_ALREADY_EXISTS: 'Admin already exists',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token provided',
};

export const AdminMessages = {
  NOT_FOUND: 'Admin not found',
  DELETED: 'Admin has been deleted',
  CREATED: 'Admin created successfully',
  UPDATED: 'Admin updated successfully',
};

export const VenueMessages = {
  NOT_FOUND: 'Venue not found',
  DELETED: 'Venue has been deleted',
  INVALID_API_KEY: 'Invalid Venue POS API key',
  MISSING_API_KEY: 'Venue POS API key header is required',
};
