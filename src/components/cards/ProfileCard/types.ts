import type { ExtendedTeamMember } from "@/data/team.data";

export type { ExtendedTeamMember };

export interface ProfileCardProps {
  member: ExtendedTeamMember;
  className?: string;
}

export interface ProfileCardState {
  isDrawerOpen: boolean;
}
