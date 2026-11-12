export type UserType = {
  _id: string
  username: string
  email?: string
  role: string
  department?: string
  isActive: boolean
  createdAt: string
  customPermissions?: Record<string, boolean>
}

export type DepartmentType = {
  _id?: string
  name: string
  code: string
  description?: string
  isSystem?: boolean
  permissions?: Record<string, boolean>
}

export const PERMISSION_CONFIG = [
  {
    key: "canCreateQuote",
    label: "Create & Import Quotes",
    desc: "Allows access to calculator, PDF upload & quote submission",
    isDeptDefault: (
      _deptCode?: string,
      role?: string,
      dept?: DepartmentType
    ) => {
      if (role === "ADMIN") return true
      return Boolean(dept?.permissions?.canCreateQuote)
    },
  },
  {
    key: "canReviewQuote",
    label: "Review & Approve Quotes",
    desc: "Approve incoming sales quotes and assign Odoo clerks",
    isDeptDefault: (
      _deptCode?: string,
      role?: string,
      dept?: DepartmentType
    ) => {
      if (role === "ADMIN") return true
      return Boolean(dept?.permissions?.canReviewQuote)
    },
  },
  {
    key: "canEditApprovedQuote",
    label: "Modify Approved Quotes",
    desc: "Unlock and edit quotes after they have already been approved",
    isDeptDefault: (
      _deptCode?: string,
      role?: string,
      dept?: DepartmentType
    ) => {
      if (role === "ADMIN") return true
      return Boolean(dept?.permissions?.canEditApprovedQuote)
    },
  },
  {
    key: "canAccessOdooQueue",
    label: "Access Odoo Entry Queue",
    desc: "View approved quotes waiting for Odoo ERP entry",
    isDeptDefault: (
      deptCode?: string,
      role?: string,
      dept?: DepartmentType
    ) => {
      if (role === "ADMIN") return true
      return Boolean(
        deptCode === "CLERK" || dept?.permissions?.canAccessOdooQueue
      )
    },
  },
  {
    key: "canMarkOdooEntry",
    label: "Mark Quotes as Done in Odoo",
    desc: "Submit official Odoo SO# and finish assignment",
    isDeptDefault: (
      deptCode?: string,
      role?: string,
      dept?: DepartmentType
    ) => {
      if (role === "ADMIN") return true
      return Boolean(
        deptCode === "CLERK" || dept?.permissions?.canMarkOdooEntry
      )
    },
  },
  {
    key: "canAccessAdmin",
    label: "Admin Portal Access",
    desc: "Allows access to backend admin navigation & settings",
    isDeptDefault: (
      _deptCode?: string,
      role?: string,
      dept?: DepartmentType
    ) => {
      if (role === "ADMIN") return true
      return Boolean(dept?.permissions?.canAccessAdmin)
    },
  },
]
