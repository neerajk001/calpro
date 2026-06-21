import { getOrCreateDeviceId } from "./deviceId";

let authToken: string | null = null;
let userEmail: string | null = null;
let userName: string | null = null;

export function setAuthToken(token: string | null, email?: string, name?: string) {
  authToken = token;
  userEmail = email ?? null;
  userName = name ?? null;
}

export function clearAuthToken() {
  authToken = null;
  userEmail = null;
  userName = null;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function getUserName(): string | null {
  return userName;
}

export function isAuthenticated(): boolean {
  return authToken !== null;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const deviceId = await getOrCreateDeviceId();

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
    if (userName) headers["X-User-Name"] = userName;
    if (userEmail) headers["X-User-Email"] = userEmail;
  }

  if (deviceId) {
    headers["X-Device-Id"] = deviceId;
  }

  return headers;
}
