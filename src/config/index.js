import dotenv from 'dotenv';
dotenv.config();

export default {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  db: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sikopet',
  },

  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  rateLimit: {
    auth: { max: 5, timeWindow: '1 minute' },
    sync: { max: 100, timeWindow: '1 minute' },
    default: { max: 1000, timeWindow: '1 minute' },
  },

  bcrypt: {
    saltRounds: 12,
  },
};
