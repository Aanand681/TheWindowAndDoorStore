import mongoose from 'mongoose';

export interface IDepartment {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  isSystem?: boolean;
  permissions: {
    canCreateQuote: boolean;
    canReviewQuote: boolean;
    canApproveQuote: boolean;
    canEditApprovedQuote: boolean;
    canAccessOdooQueue: boolean;
    canMarkOdooEntry: boolean;
    canAccessAdmin: boolean;
    canManageSettings: boolean;
    canManageStaff: boolean;
    canManagePromos: boolean;
  };
}

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    isSystem: { type: Boolean, default: false },
    permissions: {
      canCreateQuote: { type: Boolean, default: true },
      canReviewQuote: { type: Boolean, default: false },
      canApproveQuote: { type: Boolean, default: false },
      canEditApprovedQuote: { type: Boolean, default: false },
      canAccessOdooQueue: { type: Boolean, default: false },
      canMarkOdooEntry: { type: Boolean, default: false },
      canAccessAdmin: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
      canManageStaff: { type: Boolean, default: false },
      canManagePromos: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const DEFAULT_DEPARTMENTS: Array<Omit<IDepartment, '_id'>> = [
  {
    name: 'Manager',
    code: 'MANAGER',
    description: 'Reviews employee quotes, adjusts prices, approves quotes, and manages reassignments.',
    isSystem: true,
    permissions: {
      canCreateQuote: true,
      canReviewQuote: true,
      canApproveQuote: true,
      canEditApprovedQuote: true,
      canAccessOdooQueue: true,
      canMarkOdooEntry: true,
      canAccessAdmin: true,
      canManageSettings: true,
      canManageStaff: false,
      canManagePromos: false,
    },
  },
  {
    name: 'Sales Associate',
    code: 'SALES',
    description: 'Builds customer quotes, imports manufacturer PDFs, and submits quotes for manager review.',
    isSystem: true,
    permissions: {
      canCreateQuote: true,
      canReviewQuote: false,
      canApproveQuote: false,
      canEditApprovedQuote: false,
      canAccessOdooQueue: false,
      canMarkOdooEntry: false,
      canAccessAdmin: false,
      canManageSettings: false,
      canManageStaff: false,
      canManagePromos: false,
    },
  },
  {
    name: 'Clerk',
    code: 'CLERK',
    description: 'Handles approved quote files, previews/prints invoices, and enters orders into Odoo.',
    isSystem: true,
    permissions: {
      canCreateQuote: false,
      canReviewQuote: false,
      canApproveQuote: false,
      canEditApprovedQuote: false,
      canAccessOdooQueue: true,
      canMarkOdooEntry: true,
      canAccessAdmin: false,
      canManageSettings: false,
      canManageStaff: false,
      canManagePromos: false,
    },
  },
];

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
