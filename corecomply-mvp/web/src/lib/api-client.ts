import { useMsal } from '@azure/msal-react'
import { apiRequest } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`)
    this.name = 'ApiError'
  }
}

async function getAccessToken(instance: any): Promise<string> {
  const account = instance.getAllAccounts()[0]
  if (!account) {
    throw new Error('No active account')
  }

  try {
    const response = await instance.acquireTokenSilent({
      ...apiRequest,
      account,
    })
    return response.accessToken
  } catch (error) {
    const response = await instance.acquireTokenPopup(apiRequest)
    return response.accessToken
  }
}

export async function apiClient(
  endpoint: string,
  options: RequestInit = {},
  instance?: any
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (instance) {
    try {
      const token = await getAccessToken(instance)
      headers['Authorization'] = `Bearer ${token}`
    } catch (error) {
      console.error('Failed to get access token:', error)
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new ApiError(response.status, response.statusText, errorData)
  }

  // Handle blob responses (for file downloads)
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/pdf') || 
      contentType?.includes('text/csv') || 
      contentType?.includes('application/vnd.openxmlformats-officedocument') ||
      contentType?.includes('application/octet-stream')) {
    const blob = await response.blob()
    return { data: blob }
  }

  if (contentType?.includes('application/json')) {
    const data = await response.json()
    return { data }
  }

  const text = await response.text()
  return { data: text }
}

export function useApiClient() {
  const { instance } = useMsal()

  return {
    get: <T = any>(endpoint: string, options?: RequestInit): Promise<{ data: T }> =>
      apiClient(endpoint, { ...options, method: 'GET' }, instance),
    
    post: <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<{ data: T }> =>
      apiClient(
        endpoint,
        { ...options, method: 'POST', body: JSON.stringify(data) },
        instance
      ),
    
    put: <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<{ data: T }> =>
      apiClient(
        endpoint,
        { ...options, method: 'PUT', body: JSON.stringify(data) },
        instance
      ),
    
    delete: <T = any>(endpoint: string, options?: RequestInit): Promise<{ data: T }> =>
      apiClient(endpoint, { ...options, method: 'DELETE' }, instance),
    
    patch: <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<{ data: T }> =>
      apiClient(
        endpoint,
        { ...options, method: 'PATCH', body: JSON.stringify(data) },
        instance
      ),
  }
}

export const endpoints = {
  frameworks: '/frameworks',
  controls: '/controls',
  policies: '/policies',
  audits: '/audits',
  evidence: '/evidence',
  reports: '/reports',
  risks: '/risks',
  people: '/people',
  assets: '/assets',
  integrations: '/integrations',
  support: '/support',
  admin: '/admin',
} as const
