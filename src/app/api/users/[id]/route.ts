import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { cacheDelPattern, cacheSet } from "@/lib/redis"
import { handleApiError } from "@/lib/api-error"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const { id } = await params
    if (!id || typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      )
    }

    const body = await request.json()
    await dbConnect()

    // Check target user
    const targetUser = await User.findById(id)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentUserId = session.user.id
    const currentUsername =
      session.user.username?.toLowerCase() || session.user.name?.toLowerCase()
    const isSelf =
      currentUserId === id ||
      currentUsername === targetUser.username?.toLowerCase()
    const isSuperAdmin = session.user.role === "SUPERADMIN"

    // Prevent deactivating own account
    if (isSelf && body.isActive === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      )
    }

    // Protect superadmin from modification via staff management
    if (targetUser.role === "SUPERADMIN" && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Cannot modify this user" },
        { status: 403 }
      )
    }

    // Prevent promoting anyone to SUPERADMIN
    if (body.role === "SUPERADMIN" && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Cannot promote to superadmin" },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (body.role !== undefined) {
      updateData.role = body.role === "ADMIN" ? "ADMIN" : "EMPLOYEE"
    }
    if (body.department !== undefined) {
      updateData.department = String(body.department).toUpperCase().trim()
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    // Custom individual permissions (Superadmin only)
    if (body.customPermissions !== undefined) {
      if (!isSuperAdmin) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
      updateData.customPermissions = body.customPermissions
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )

    // Invalidate user cache and revoke active sessions if deactivated
    cacheDelPattern("users:*").catch(() => {})
    if (body.isActive === false) {
      cacheSet(`user:revoked:${id}`, Date.now(), 86400).catch(() => {})
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error: any) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const { id } = await params
    if (!id || typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check target user
    const targetUser = await User.findById(id)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentUserId = session.user.id
    const currentUsername =
      session.user.username?.toLowerCase() || session.user.name?.toLowerCase()
    const isSelf =
      currentUserId === id ||
      currentUsername === targetUser.username?.toLowerCase()

    // Prevent deleting self
    if (isSelf) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      )
    }

    // Protect superadmin from deletion
    if (targetUser.role === "SUPERADMIN") {
      return NextResponse.json(
        { error: "Cannot delete this user" },
        { status: 403 }
      )
    }

    await User.findByIdAndDelete(id)

    // Invalidate user cache and revoke any active sessions
    cacheDelPattern("users:*").catch(() => {})
    cacheSet(`user:revoked:${id}`, Date.now(), 86400).catch(() => {})

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: any) {
    return handleApiError(error)
  }
}
