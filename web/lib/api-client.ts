import axios, { type AxiosInstance } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

let apiClient: AxiosInstance | null = null

export function initializeApiClient(token?: string) {
  apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear auth on 401
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token")
          window.location.href = "/login"
        }
      }
      return Promise.reject(error)
    },
  )

  return apiClient
}

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    initializeApiClient()
  }
  return apiClient!
}

export function setAuthToken(token: string) {
  const client = getApiClient()
  client.defaults.headers.common["Authorization"] = `Bearer ${token}`
}
