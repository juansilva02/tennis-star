import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";

export interface MembershipOption { id: string; name: string }

export function getMembershipOptions() {
  return api<ApiResponse<MembershipOption[]>>("/memberships");
}
