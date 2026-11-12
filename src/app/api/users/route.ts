import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User, { UserRole } from "@/models/User"
import Department from "@/models/Department"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { cacheGet, cacheSet, cacheDelPattern } from "@/lib/redis"
import { handleApiError } from "@/lib/api-error"

export const dynamic = "force-dynamic"
export const revalidate = 0

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}

const USER_CACHE_TTL = 300 // 5 minutes server-side cache

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reviewersOnly = searchParams.get("reviewersOnly") === "true"
    const assignees = searchParams.get("assignees") === "true"
    const roleParam = searchParams.get("role")

    if (assignees) {
      const cacheKey = "users:assignees"
      const cached = await cacheGet(cacheKey)
      if (cached)
        return NextResponse.json(cached, { headers: NO_CACHE_HEADERS })

      await dbConnect()
      // Find departments that have Odoo permissions
      const odooDepts = await Department.find({
        $or: [
          { "permissions.canAccessOdooQueue": true },
          { "permissions.canMarkOdooEntry": true },
          { code: "CLERK" },
        ],
      })
      const odooDeptCodes = odooDepts.map((d) => d.code)

      // Return staff who have Odoo permissions (department or custom individual override) or are Admin
      const staff = await User.find(
        {
          role: { $ne: "SUPERADMIN" },
          isActive: { $ne: false },
          $or: [
            { department: { $in: odooDeptCodes } },
            { department: "CLERK" },
            { role: "ADMIN" },
            { "customPermissions.canAccessOdooQueue": true },
            { "customPermissions.canMarkOdooEntry": true },
          ],
        },
        "username role email department customPermissions"
      ).sort({ username: 1 })

      cacheSet(cacheKey, staff, USER_CACHE_TTL).catch(() => {})
      return NextResponse.json(staff, { headers: NO_CACHE_HEADERS })
    }

    if (reviewersOnly) {
      const cacheKey = "users:reviewers"
      const cached = await cacheGet(cacheKey)
      if (cached)
        return NextResponse.json(cached, { headers: NO_CACHE_HEADERS })

      await dbConnect()
      const reviewerDepts = await Department.find({
        $or: [
          { "permissions.canReviewQuote": true },
          { "permissions.canApproveQuote": true },
          { code: "MANAGER" },
        ],
      })
      const reviewerDeptCodes = reviewerDepts.map((d) => d.code)

      const staff = await User.find(
        {
          role: { $ne: "SUPERADMIN" },
          isActive: { $ne: false },
          $or: [
            { role: "ADMIN" },
            { department: { $in: reviewerDeptCodes } },
            { department: "MANAGER" },
            { "customPermissions.canReviewQuote": true },
          ],
        },
        "username role email department"
      ).sort({ username: 1 })

      cacheSet(cacheKey, staff, USER_CACHE_TTL).catch(() => {})
      return NextResponse.json(staff, { headers: NO_CACHE_HEADERS })
    }

    if (roleParam) {
      if (["SUPERADMIN", "superadmin"].includes(roleParam)) {
        return NextResponse.json([], { headers: NO_CACHE_HEADERS })
      }
      const cacheKey = `users:role:${roleParam}`
      const cached = await cacheGet(cacheKey)
      if (cached)
        return NextResponse.json(cached, { headers: NO_CACHE_HEADERS })

      await dbConnect()
      const users = await User.find(
        {
          role: roleParam as UserRole,
        },
        "-password"
      ).sort({ createdAt: -1 })

      cacheSet(cacheKey, users, USER_CACHE_TTL).catch(() => {})
      return NextResponse.json(users, { headers: NO_CACHE_HEADERS })
    }

    // Exclude SUPERADMIN for general staff listings
    const cacheKey = "users:all"
    const cached = await cacheGet(cacheKey)
    if (cached) return NextResponse.json(cached, { headers: NO_CACHE_HEADERS })

    await dbConnect()
    const users = await User.find(
      {
        role: { $ne: "SUPERADMIN" },
      },
      "-password"
    ).sort({ createdAt: -1 })

    cacheSet(cacheKey, users, USER_CACHE_TTL).catch(() => {})
    return NextResponse.json(users, { headers: NO_CACHE_HEADERS })
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const { username, password, role, email, department } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Strictly disallow creating a SUPERADMIN account
    if (role === "SUPERADMIN") {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 })
    }

    // Only allow valid staff roles
    const assignedRole = role === "ADMIN" ? "ADMIN" : "EMPLOYEE"
    const assignedDept =
      department || (assignedRole === "ADMIN" ? "MANAGER" : "SALES")

    await dbConnect()

    // Check if user exists
    const existing = await User.findOne({ username })
    if (existing) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      username,
      email: email || undefined,
      password: hashedPassword,
      role: assignedRole,
      department: assignedDept,
    })

    // Invalidate user cache keys
    cacheDelPattern("users:*").catch(() => {})

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          username: newUser.username,
          role: newUser.role,
          department: newUser.department,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    return handleApiError(error)
  }
}
