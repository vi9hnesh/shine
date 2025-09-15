"use client";

import { useCallback, useEffect, useState } from "react";

function key(ns: string) {
  return `shine.settings.${ns}`;
}

export function readSettings<T>(ns: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key(ns));
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...(parsed ?? {}) } as T;
  } catch {
    return defaults;
  }
}

export function writeSettings<T>(ns: string, value: T) {
  try {
    localStorage.setItem(key(ns), JSON.stringify(value));
    // Defer the cross-component notification until after paint
    setTimeout(() => {
      try {
        window.dispatchEvent(new CustomEvent(`settings:update:${ns}`));
      } catch {}
    }, 0);
  } catch {}
}

export function useSettings<T extends object>(ns: string, defaults: T) {
  const [settings, setSettingsState] = useState<T>(defaults as T);

  // Initialize and sync
  useEffect(() => {
    setSettingsState(readSettings(ns, defaults));
    const onStorage = (e: StorageEvent) => {
      if (e.key === key(ns)) setSettingsState(readSettings(ns, defaults));
    };
    const onCustom = () => setSettingsState(readSettings(ns, defaults));
    window.addEventListener("storage", onStorage);
    window.addEventListener(`settings:update:${ns}`, onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(`settings:update:${ns}`, onCustom as EventListener);
    };
  }, [ns, defaults]);

  const setSettings = useCallback((patch: Partial<T> | ((prev: T) => Partial<T>) | T) => {
    const prevVal = readSettings(ns, defaults);
    const delta = typeof patch === "function" ? (patch as (p: T) => Partial<T>)(prevVal) : (patch as Partial<T>);
    const next = { ...prevVal, ...delta } as T;
    writeSettings(ns, next);
    setSettingsState(next);
  }, [ns, defaults]);

  const reset = useCallback(() => {
    writeSettings(ns, defaults);
    setSettingsState(defaults);
  }, [ns, defaults]);

  return [settings, setSettings, reset] as const;
}
