import { DefaultSession } from "next-auth"

export type UserRole = "SUPERADMIN" | "ADMIN" | "EMPLOYEE"

declare module "next-auth" {
  interface User {
    id: string
    role: UserRole
    department?: string
    landingPage?: string
    muteNotifications?: boolean
    canAccessAdmin?: boolean
    username?: string
    defaultQuotingMode?: "installation" | "supply_only"
    favoriteTemplate?: "universal" | "modern" | "executive" | "cards" | "compact" | "breakdown"
  }

  interface Session {
    user: {
      id: string
      role: UserRole
      department?: string
      landingPage?: string
      muteNotifications?: boolean
      canAccessAdmin?: boolean
      username?: string
      defaultQuotingMode?: "installation" | "supply_only"
      favoriteTemplate?: "universal" | "modern" | "executive" | "cards" | "compact" | "breakdown"
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    name?: string
    role?: UserRole
    department?: string
    landingPage?: string
    muteNotifications?: boolean
    canAccessAdmin?: boolean
    username?: string
    defaultQuotingMode?: "installation" | "supply_only"
    favoriteTemplate?: "universal" | "modern" | "executive" | "cards" | "compact" | "breakdown"
    authTime?: number
  }
}
