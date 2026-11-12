"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  UserType,
  DepartmentType,
  PERMISSION_CONFIG,
} from "@/components/admin/staff/types"

export function useAdminStaff() {
  const [users, setUsers] = useState<UserType[]>([])
  const [departments, setDepartments] = useState<DepartmentType[]>([])
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // New User Form State
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("EMPLOYEE")
  const [department, setDepartment] = useState("SALES")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState("")
  const [editDepartment, setEditDepartment] = useState("")

  // Delete Modal State
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  // Custom User Permissions Modal State (Superadmin)
  const [userForCustomPerms, setUserForCustomPerms] = useState<UserType | null>(
    null
  )
  const [userCustomPerms, setUserCustomPerms] = useState<
    Record<string, boolean>
  >({})
  const [savingUserPerms, setSavingUserPerms] = useState(false)

  const fetchUsersAndDepts = async () => {
    try {
      const [uRes, dRes, pRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/departments"),
        fetch("/api/profile"),
      ])
      const [uData, dData, pData] = await Promise.all([
        uRes.json(),
        dRes.json(),
        pRes.ok ? pRes.json() : null,
      ])

      if (Array.isArray(uData)) setUsers(uData)
      if (Array.isArray(dData)) setDepartments(dData)
      if (pData) setCurrentProfile(pData)
    } catch (err) {
      console.error("Failed to fetch data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersAndDepts()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role, email, department }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create user")

      setSuccess("User created successfully!")
      toast.success(`Account for ${username} created!`)
      setUsername("")
      setPassword("")
      setEmail("")
      setRole("EMPLOYEE")
      setDepartment("SALES")
      fetchUsersAndDepts()
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      fetchUsersAndDepts()
    } catch (err) {
      console.error(err)
    }
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    try {
      const res = await fetch(`/api/users/${userToDelete}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete user")
      setUserToDelete(null)
      toast.success("User deleted permanently.")
      fetchUsersAndDepts()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user")
      console.error(err)
    }
  }

  const handleOpenCustomPerms = (u: UserType) => {
    setUserForCustomPerms(u)
    const userDept = departments.find((d) => d.code === u.department)
    const initialPerms: Record<string, boolean> = {}
    PERMISSION_CONFIG.forEach((p) => {
      if (u.customPermissions && u.customPermissions[p.key] !== undefined) {
        initialPerms[p.key] = Boolean(u.customPermissions[p.key])
      } else {
        initialPerms[p.key] = p.isDeptDefault(u.department, u.role, userDept)
      }
    })
    setUserCustomPerms(initialPerms)
  }

  const handleSaveUserCustomPerms = async () => {
    if (!userForCustomPerms) return
    setSavingUserPerms(true)
    try {
      const res = await fetch(`/api/users/${userForCustomPerms._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPermissions: userCustomPerms }),
      })
      const data = await res.json()
      if (!res.ok)
        throw new Error(data.error || "Failed to update custom permissions")
      toast.success(
        `Custom permissions updated for ${userForCustomPerms.username}!`
      )
      setUserForCustomPerms(null)
      fetchUsersAndDepts()
    } catch (err: any) {
      toast.error(err.message || "Failed to update custom permissions")
    } finally {
      setSavingUserPerms(false)
    }
  }

  const handleSaveRole = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole, department: editDepartment }),
      })
      setEditingId(null)
      toast.success("User updated successfully.")
      fetchUsersAndDepts()
    } catch (err) {
      console.error(err)
    }
  }

  const isSuperAdmin = currentProfile?.role === "SUPERADMIN"

  return {
    users,
    departments,
    currentProfile,
    loading,
    username,
    setUsername,
    password,
    setPassword,
    email,
    setEmail,
    role,
    setRole,
    department,
    setDepartment,
    error,
    success,
    editingId,
    setEditingId,
    editRole,
    setEditRole,
    editDepartment,
    setEditDepartment,
    userToDelete,
    setUserToDelete,
    userForCustomPerms,
    setUserForCustomPerms,
    userCustomPerms,
    setUserCustomPerms,
    savingUserPerms,
    handleCreateUser,
    handleToggleActive,
    confirmDelete,
    handleOpenCustomPerms,
    handleSaveUserCustomPerms,
    handleSaveRole,
    isSuperAdmin,
    fetchUsersAndDepts,
  }
}
