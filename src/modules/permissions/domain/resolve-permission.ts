import type { UserRole } from "@/data/database.types";

export type PermissionKey = `${string}.${string}`;

export interface PermissionResolutionInput {
  role: UserRole;
  key: PermissionKey;
  userOverride?: boolean | null;
  roleOverride?: boolean | null;
  defaults: Readonly<Partial<Record<UserRole, readonly PermissionKey[]>>>;
}

export function resolvePermission(input: PermissionResolutionInput): boolean {
  if (input.role === "owner") return true;
  if (input.userOverride !== undefined && input.userOverride !== null) {
    return input.userOverride;
  }
  if (input.roleOverride !== undefined && input.roleOverride !== null) {
    return input.roleOverride;
  }
  return input.defaults[input.role]?.includes(input.key) ?? false;
}
