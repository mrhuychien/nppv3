import type { UserRole } from "@/data/database.types";

export interface CurrentUser {
  id: string;
  organizationId: string;
  fullName: string;
  role: UserRole;
  phone: string | null;
  active: boolean;
  canEditPrice: boolean;
  maxPriceIncreasePercent: number;
}
