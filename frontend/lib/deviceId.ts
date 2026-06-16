let deviceId: string | null = null;

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  if (deviceId) return deviceId;

  const stored = localStorage.getItem("calpro:deviceId");
  if (stored) {
    deviceId = stored;
    return deviceId;
  }

  deviceId = crypto.randomUUID();
  localStorage.setItem("calpro:deviceId", deviceId);
  return deviceId;
}
