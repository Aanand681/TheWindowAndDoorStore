import { z } from 'zod';

const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Auth
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z.coerce.boolean().optional(),

  // Email (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Pusher Real-Time Notifications
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().optional(),
  NEXT_PUBLIC_PUSHER_KEY: z.string().optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().optional(),

  // Geolocation & Mapping
  ORS_API_KEY: z.string().optional(),
  GEOCODER_EMAIL: z.string().optional(),

  // Redis / Upstash (Optional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // App Base URL
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export const env = envSchema.parse({
  ...process.env,
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000',
});

export type Env = z.infer<typeof envSchema>;
