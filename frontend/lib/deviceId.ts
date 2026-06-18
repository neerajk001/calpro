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

export function clearDeviceId(): void {
  deviceId = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("calpro:deviceId");
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("calpro:claimed:")) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }
}
