import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import User from '@/models/User';

// Enable multi-host and LAN IP support (e.g. 192.168.x.x, localhost, custom domains)
process.env.AUTH_TRUST_HOST = 'true';

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

        return {
          id: user._id.toString(),
          name: user.username || user.email,
          email: user.email,
          role: user.role,
          department: user.department || (user.role === 'SUPERADMIN' || user.username?.toLowerCase() === 'kyle' ? 'MANAGER' : 'SALES'),
          landingPage: user.landingPage || 'calculator',
          muteNotifications: user.muteNotifications || false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.department = (user as any).department;
        token.id = (user as any).id;
        token.landingPage = (user as any).landingPage || 'calculator';
        token.muteNotifications = (user as any).muteNotifications || false;
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
