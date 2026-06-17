import { getOrCreateDeviceId } from "./deviceId";

let authToken: string | null = null;
let userEmail: string | null = null;
let userName: string | null = null;
let userImage: string | null = null;

export function setAuthToken(token: string | null, email?: string, name?: string, image?: string) {
  authToken = token;
  userEmail = email ?? null;
  userName = name ?? null;
  userImage = image ?? null;
}

export function clearAuthToken() {
  authToken = null;
  userEmail = null;
  userName = null;
  userImage = null;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function isAuthenticated(): boolean {
  return authToken !== null;
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
    if (userName) headers["X-User-Name"] = userName;
    if (userImage) headers["X-User-Image"] = userImage;
  } else {
    const deviceId = getOrCreateDeviceId();
    if (deviceId) {
      headers["X-Device-Id"] = deviceId;
    }
  }

  return headers;
}
