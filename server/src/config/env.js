import dotenv from 'dotenv';

dotenv.config();

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/ecampus_elo_portal'),
  jwt: {
    secret: required('JWT_SECRET', 'dev-only-insecure-secret-change-me'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-only-insecure-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  bcryptRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 10),
  seedPassword: process.env.SEED_DEFAULT_PASSWORD || 'Portal@123',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
};

if (env.isProd && env.jwt.secret.startsWith('dev-only')) {
  throw new Error('JWT_SECRET must be set to a strong secret in production.');
}
