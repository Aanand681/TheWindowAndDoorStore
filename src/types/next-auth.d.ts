import { DefaultSession } from 'next-auth';

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'EMPLOYEE';

declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
    department?: string;
    landingPage?: string;
    muteNotifications?: boolean;
    canAccessAdmin?: boolean;
    username?: string;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      department?: string;
      landingPage?: string;
      muteNotifications?: boolean;
      canAccessAdmin?: boolean;
      username?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
    department?: string;
    landingPage?: string;
    muteNotifications?: boolean;
    canAccessAdmin?: boolean;
    username?: string;
    authTime?: number;
  }
}

