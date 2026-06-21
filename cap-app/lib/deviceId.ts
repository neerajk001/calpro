import AsyncStorage from "@react-native-async-storage/async-storage";

let deviceId: string | null = null;

export async function getOrCreateDeviceId(): Promise<string> {
  if (deviceId) return deviceId;

  const stored = await AsyncStorage.getItem("calpro:deviceId");
  if (stored) {
    deviceId = stored;
    return deviceId;
  }

  deviceId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  await AsyncStorage.setItem("calpro:deviceId", deviceId);
  return deviceId;
}

export function getDeviceIdSync(): string | null {
  return deviceId;
}

export async function clearDeviceId(): Promise<void> {
  deviceId = null;
  await AsyncStorage.removeItem("calpro:deviceId");
  const keys = await AsyncStorage.getAllKeys();
  const claimedKeys = keys.filter((k) => k.startsWith("calpro:claimed:"));
  for (const key of claimedKeys) {
    await AsyncStorage.removeItem(key);
  }
}
