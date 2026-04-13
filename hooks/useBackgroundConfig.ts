"use client";
import { useEffect, useState, useMemo } from 'react';
import { useRegistry } from '../lib/context/RegistryContext';
import { defaultConfigs } from '../lib/schemas';

// Helper to generate IDs if not provided
const generateTempId = () => `bg-${Math.random().toString(36).substr(2, 6)}`;

export function useBackgroundConfig<T>(
    propsId: string | undefined, 
    type: string, 
    propsConfig: T | undefined
): T {
  const registry = useRegistry();
  
  // Create a stable ID if one isn't provided via props
  const [internalId] = useState(() => propsId || generateTempId());
  const id = propsId || internalId;

  // Initial config resolution: Props -> Default -> Empty
  // We use a ref to track if we've initialized to prevent resetting on prop reference changes
  // unless the ID itself changes.
  const initialConfig = useMemo(() => {
    return propsConfig || defaultConfigs[type] || {};
  }, [propsConfig, type]);

  // Register on mount
  useEffect(() => {
    if (registry) {
      registry.register(id, type, initialConfig);
      
      // CRITICAL CHANGE: We do NOT unregister on cleanup.
      // This prevents the config from resetting to defaults/props when the parent component 
      // re-renders (which generates a new 'initialConfig' object reference).
      // In a "Site Builder" context, we want the registry state to win until explicitly cleared.
      
      // return () => {
      //    registry.unregister(id);
      // };
    }
  }, [registry, id, type]); // Removed initialConfig from deps to prevent re-registration loops

  // Return the config from registry (if edited) or the initial/props config
  if (registry && registry.items[id]) {
      return registry.items[id].config;
  }
  
  return initialConfig;
}