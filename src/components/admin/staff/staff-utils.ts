import { DepartmentType } from './types';

export function getDeptBadgeClass(deptCode?: string): string {
  switch (deptCode) {
    case 'MANAGER':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
    case 'CLERK':
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25';
    case 'SALES':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
    default:
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25';
  }
}

export function getDeptDisplayName(departments: DepartmentType[], deptCode?: string): string {
  const match = departments.find((d) => d.code === deptCode);
  return match ? match.name : deptCode || 'Sales Associate';
}

