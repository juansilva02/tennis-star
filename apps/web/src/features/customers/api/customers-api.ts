import { getCatalogOptions } from "@/lib/api/catalog-options";

export interface MembershipOption { id: string; name: string }

export function getMembershipOptions() {
  return getCatalogOptions<MembershipOption>("/memberships");
}
