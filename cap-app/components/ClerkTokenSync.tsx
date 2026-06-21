import { useEffect, useRef, type ReactNode } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { setAuthToken, clearAuthToken } from "@/lib/authStore";
import { useApp } from "@/lib/AppContext";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOrCreateDeviceId } from "@/lib/deviceId";
import { apiClient } from "@/lib/apiClient";

export function ClerkTokenSync({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const { rehydrate } = useApp();

  // Create refs to store unstable function/object references
  const userRef = useRef(user);
  const getTokenRef = useRef(getToken);
  const rehydrateRef = useRef(rehydrate);

  // Sync refs on every render
  useEffect(() => {
    userRef.current = user;
    getTokenRef.current = getToken;
    rehydrateRef.current = rehydrate;
  });

  const userId = user?.id;

  useEffect(() => {
    if (!isSignedIn) {
      clearAuthToken();
      rehydrateRef.current(true);
      return;
    }

    const refreshToken = async () => {
      try {
        const token = await getTokenRef.current();
        if (token) {
          setAuthToken(
            token,
            userRef.current?.primaryEmailAddress?.emailAddress,
            userRef.current?.fullName || undefined
          );

          // Robustness: Merging local/anonymous mobile data with authenticated user profile
          const deviceId = await getOrCreateDeviceId();
          const email = userRef.current?.primaryEmailAddress?.emailAddress;
          if (deviceId && email) {
            const claimKey = `calpro:claimed:${email}:${deviceId}`;
            const alreadyClaimed = await AsyncStorage.getItem(claimKey);
            if (!alreadyClaimed) {
              try {
                const claimRes = await apiClient.claimAnonymousData(deviceId);
                if (claimRes?.merged) {
                  console.log("[ClerkTokenSync] Successfully claimed and merged anonymous data for:", email);
                }
                await AsyncStorage.setItem(claimKey, "true");
              } catch (claimErr) {
                console.error("[ClerkTokenSync] Failed to claim anonymous data:", claimErr);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to refresh Clerk token:", err);
      }
    };

    // Initial fetch
    refreshToken().then(() => {
      rehydrateRef.current(true);
    });

    // Refresh periodically (Clerk tokens expire in 60 seconds)
    const interval = setInterval(refreshToken, 45000);

    // Refresh when app comes back to foreground
    const appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        refreshToken();
      }
    });

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [isSignedIn, userId]);

  return <>{children}</>;
}
