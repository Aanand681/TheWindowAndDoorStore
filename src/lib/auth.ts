import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import User from '@/models/User';
import Department from '@/models/Department';

// Enable multi-host and LAN IP support (e.g. 192.168.x.x, localhost, custom domains)
process.env.AUTH_TRUST_HOST = 'true';

// Safeguard: On Vercel / Production, if NEXTAUTH_URL was mistakenly set to localhost,
// auto-correct it to the live VERCEL_URL or delete it so NextAuth auto-detects the request origin
if (
  (process.env.VERCEL || process.env.NODE_ENV === 'production') &&
  process.env.NEXTAUTH_URL?.includes('localhost')
) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else {
    delete process.env.NEXTAUTH_URL;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        usernameOrEmail: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.usernameOrEmail || !credentials?.password) {
          throw new Error('Please enter username/email and password');
        }

        await dbConnect();

        // Check if the input is an email or username
        const isEmail = credentials.usernameOrEmail.includes('@');
        const query = isEmail
          ? { email: credentials.usernameOrEmail }
          : { username: credentials.usernameOrEmail };

        const user = await User.findOne(query);

        if (!user) {
          throw new Error('No user found');
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          throw new Error('Invalid password');
        }

        const isSuper = user.role === 'SUPERADMIN' || user.username?.toLowerCase() === 'cheeku';
        let canAccessAdmin = isSuper || user.role === 'ADMIN';
        if (!canAccessAdmin) {
          if (user.customPermissions?.canAccessAdmin === true) {
            canAccessAdmin = true;
          } else if (user.department) {
            const dept = await Department.findOne({ code: user.department });
            if (dept?.permissions?.canAccessAdmin) {
              canAccessAdmin = true;
            }
          }
        }

        return {
          id: user._id.toString(),
          name: user.username || user.email,
          email: user.email,
          role: user.role,
          department: user.department || (user.role === 'SUPERADMIN' || user.username?.toLowerCase() === 'kyle' ? 'MANAGER' : 'SALES'),
          landingPage: user.landingPage || 'calculator',
          muteNotifications: user.muteNotifications || false,
          canAccessAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return url;
      // Allows callback URLs on the same origin
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch (_) {}
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.department = (user as any).department;
        token.id = (user as any).id;
        token.landingPage = (user as any).landingPage || 'calculator';
        token.muteNotifications = (user as any).muteNotifications || false;
        token.canAccessAdmin = Boolean((user as any).canAccessAdmin);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
        (session.user as any).id = token.id;
        (session.user as any).landingPage = token.landingPage || 'calculator';
        (session.user as any).muteNotifications = token.muteNotifications || false;
        (session.user as any).canAccessAdmin = Boolean(token.canAccessAdmin);
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // We will build this page later
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
