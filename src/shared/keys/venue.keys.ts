export const VenueMessages = {
  NOT_FOUND: 'Venue not found',
  NOT_FOUND_OR_DELETED: 'Venue not found or already deleted',
  DELETED: 'Venue has been deleted',
  INVALID_API_KEY: 'Invalid Venue POS API key',
  MISSING_API_KEY: 'Venue POS API key header is required',
  DUPLICATE_NAME: 'Venue with this name already exists',
};

export const VenueApiCredentialValidationErrors = {
  BEARER_TOKEN_REQUIRED: 'token is required for BEARER_TOKEN',
  BASIC_AUTH_REQUIRED: 'username and password are required for BASIC_AUTH',
  API_KEY_REQUIRED: 'apiKey is required for API_KEY',
  OAUTH2_CLIENT_CREDENTIALS_REQUIRED: 'clientId, clientSecret and tokenUrl are required for OAUTH2_CLIENT_CREDENTIALS',
  OAUTH2_REFRESH_TOKEN_REQUIRED: 'clientId, clientSecret, refreshToken and tokenUrl are required for OAUTH2_REFRESH_TOKEN',
  JWT_REQUIRED: 'jwtToken is required for JWT',
  CUSTOM_HEADERS_REQUIRED: 'headers are required for CUSTOM_HEADERS',
  INVALID_API_KEY_TYPE: 'Invalid apiKeyType',
  CREDENTIALS_REQUIRED: 'Authentication credentials are required',
};
