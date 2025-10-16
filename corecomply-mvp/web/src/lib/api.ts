import { msalInstance, loginRequest } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api'

async function getAccessToken(): Promise<string> {
  const accounts = msalInstance.getAllAccounts()
  if (accounts.length === 0) {
    await msalInstance.loginRedirect(loginRequest)
    throw new Error('No account found')
  }

  const response = await msalInstance.acquireTokenSilent({
    ...loginRequest,
    account: accounts[0],
  })

  return response.accessToken
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

export async function uploadFile(
  endpoint: string,
  file: File,
  additionalData?: Record<string, string | number>
): Promise<any> {
  const token = await getAccessToken()
  const formData = new FormData()
  formData.append('file', file)

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value))
    })
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload error: ${response.statusText}`)
  }

  return response.json()
}
