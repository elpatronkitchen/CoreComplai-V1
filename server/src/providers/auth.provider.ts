const authProvider = process.env.AUTH_PROVIDER || "mock";

export type UserRole =
  | "Auditor"
  | "Lawyer"
  | "PayrollManager"
  | "HRManager"
  | "ComplianceOwner"
  | "CFO"
  | "ITSecurity";

export interface UserClaims {
  userId: string;
  email: string;
  name: string;
  roles: UserRole[];
}

export async function getUserClaims(sessionId: string): Promise<UserClaims | null> {
  if (authProvider === "entra") {
    return null;
  } else {
    return getMockUserClaims(sessionId);
  }
}

export function getMockUserClaims(sessionId: string): UserClaims {
  return {
    userId: "user-mock-001",
    email: "reviewer@corecomply.com.au",
    name: "Sarah Chen",
    roles: ["Lawyer", "ComplianceOwner"],
  };
}

export function hasRole(claims: UserClaims, role: UserRole): boolean {
  return claims.roles.includes(role);
}

export function hasAnyRole(claims: UserClaims, roles: UserRole[]): boolean {
  return claims.roles.some((r) => roles.includes(r));
}
