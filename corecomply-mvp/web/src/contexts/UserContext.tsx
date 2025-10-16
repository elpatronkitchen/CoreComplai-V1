import { createContext, useContext, ReactNode } from 'react'
import { useMsal, useAccount } from '@azure/msal-react'
import { hasPermission, type Permission } from '../lib/permissions'

export type UserRole = 
  | 'system_admin'
  | 'compliance_owner'
  | 'payroll_officer'
  | 'hr_officer'
  | 'finance_manager'
  | 'executive'
  | 'internal_auditor'
  | 'external_auditor'
  | 'reviewer'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
}

interface UserContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  hasPermission: (permission: Permission) => boolean
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

function extractRoleFromClaims(claims: any): UserRole {
  // B2C custom attributes are prefixed with extension_
  const role = claims?.extension_Role || claims?.role || claims?.roles?.[0]
  
  // Map B2C role to application role
  const roleMapping: Record<string, UserRole> = {
    'SystemAdministrator': 'system_admin',
    'ComplianceOwner': 'compliance_owner',
    'PayrollOfficer': 'payroll_officer',
    'HROfficer': 'hr_officer',
    'FinanceManager': 'finance_manager',
    'Executive': 'executive',
    'InternalAuditor': 'internal_auditor',
    'ExternalAuditor': 'external_auditor',
    'Reviewer': 'reviewer',
  }

  return roleMapping[role] || 'reviewer' // Default to least privileged role
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { instance, accounts } = useMsal()
  const account = useAccount(accounts[0] || {})

  const user: User | null = account ? {
    id: account.localAccountId,
    username: account.username || account.name || '',
    email: account.username || '',
    firstName: (account.idTokenClaims as any)?.given_name || account.name?.split(' ')[0] || '',
    lastName: (account.idTokenClaims as any)?.family_name || account.name?.split(' ').slice(1).join(' ') || '',
    role: extractRoleFromClaims(account.idTokenClaims),
    avatar: undefined,
  } : null

  const logout = async () => {
    await instance.logoutRedirect()
  }

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false
    return hasPermission(user, permission)
  }

  const value: UserContextValue = {
    user,
    isAuthenticated: !!account,
    isLoading: false,
    hasPermission: checkPermission,
    logout,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
