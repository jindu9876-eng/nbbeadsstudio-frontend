import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, adminApi } from "../api";

interface SettingsContextType {
  hidePriceAndCart: boolean;
  loading: boolean;
  setHidePriceAndCart: (val: boolean) => void;
  toggleHidePriceAndCart: () => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Broadcast channel for instantaneous cross-tab updates between Admin and Storefront
let settingsChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    settingsChannel = new BroadcastChannel("nb_beads_settings_channel");
  }
} catch {
  // Graceful fallback if BroadcastChannel is restricted
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hidePriceAndCart, setHidePriceAndCartState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        setHidePriceAndCartState(Boolean(res.data.hide_price_and_cart));
      }
    } catch (err) {
      console.error("Failed to load storefront settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Listen to cross-tab broadcast notifications
    if (settingsChannel) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && typeof event.data.hidePriceAndCart === "boolean") {
          setHidePriceAndCartState(event.data.hidePriceAndCart);
        }
      };
      settingsChannel.addEventListener("message", handleMessage);
      return () => {
        settingsChannel?.removeEventListener("message", handleMessage);
      };
    }
  }, [fetchSettings]);

  const setHidePriceAndCart = (val: boolean) => {
    setHidePriceAndCartState(val);
    if (settingsChannel) {
      settingsChannel.postMessage({ hidePriceAndCart: val });
    }
  };

  const toggleHidePriceAndCart = async (): Promise<boolean> => {
    try {
      const res = await adminApi.toggleCatalogMode();
      if (res.success && res.data) {
        const newVal = Boolean(res.data.hide_price_and_cart);
        setHidePriceAndCartState(newVal);
        if (settingsChannel) {
          settingsChannel.postMessage({ hidePriceAndCart: newVal });
        }
        return newVal;
      }
      return hidePriceAndCart;
    } catch (err) {
      console.error("Failed to toggle catalog mode:", err);
      throw err;
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider
      value={{
        hidePriceAndCart,
        loading,
        setHidePriceAndCart,
        toggleHidePriceAndCart,
        refreshSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    // Return a safe default object if used outside provider
    return {
      hidePriceAndCart: false,
      loading: false,
      setHidePriceAndCart: () => {},
      toggleHidePriceAndCart: async () => false,
      refreshSettings: async () => {}
    };
  }
  return context;
};
