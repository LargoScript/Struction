"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Defines the data stored for each active background component
export interface RegistryItem {
  id: string;
  type: string;
  config: any;
}

interface RegistryContextType {
  items: Record<string, RegistryItem>;
  register: (id: string, type: string, initialConfig: any) => void;
  unregister: (id: string) => void;
  updateConfig: (id: string, newConfig: any) => void;
  getConfig: (id: string) => any;
}

const RegistryContext = createContext<RegistryContextType | null>(null);

export const RegistryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Record<string, RegistryItem>>({});

  const register = useCallback((id: string, type: string, initialConfig: any) => {
    setItems(prev => {
        // If it already exists, don't overwrite user changes with initial props
        // unless it's a completely new mount (which we can't easily distinguish from remount).
        // For safety, if it exists in our state, we keep our state.
        if (prev[id]) return prev;
        return {
            ...prev,
            [id]: { id, type, config: initialConfig }
        };
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setItems(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const updateConfig = useCallback((id: string, newConfig: any) => {
    setItems(prev => {
        if (!prev[id]) return prev;
        return {
            ...prev,
            [id]: { ...prev[id], config: { ...prev[id].config, ...newConfig } }
        };
    });
  }, []);

  const getConfig = useCallback((id: string) => {
      return items[id]?.config;
  }, [items]);

  return (
    <RegistryContext.Provider value={{ items, register, unregister, updateConfig, getConfig }}>
      {children}
    </RegistryContext.Provider>
  );
};

export const useRegistry = () => useContext(RegistryContext);
