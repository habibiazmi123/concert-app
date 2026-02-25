export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-change-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  booking: {
    expirationMinutes: parseInt(process.env.BOOKING_EXPIRATION_MINUTES || '10', 10),
    lockTtlSeconds: parseInt(process.env.LOCK_TTL_SECONDS || '5', 10),
    maxRetries: parseInt(process.env.MAX_LOCK_RETRIES || '3', 10),
    processDelayMs: parseInt(process.env.BOOKING_PROCESS_DELAY_MS || '0', 10),
  },
  payment: {
    successRate: parseFloat(process.env.PAYMENT_SUCCESS_RATE || '0.9'),
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'concert-app',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false', // true for MinIO
  },
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  },
});
