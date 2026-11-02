import { useEffect, useState, useCallback } from "react";

const STORAGE_KEYS = {
  done: "br-roadmap-done",
  dod: "br-roadmap-dod",
  names: "br-roadmap-names",
} as const;

type StorageKey = keyof typeof STORAGE_KEYS;

function getLocal<T>(key: StorageKey, initial: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[key]);
    return raw ? (JSON.parse(raw) as T) : initial;
  } catch {
    return initial;
  }
}

function setLocal<T>(key: StorageKey, value: T) {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

async function kvGet<T>(key: string, initial: T): Promise<T> {
  if (!import.meta.env.VITE_KV_REST_API_URL || !import.meta.env.VITE_KV_REST_API_TOKEN) {
    return initial;
  }
  try {
    const res = await fetch(`${import.meta.env.VITE_KV_REST_API_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${import.meta.env.VITE_KV_REST_API_TOKEN}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.result ?? initial;
    }
  } catch {
    /* ignore network errors */
  }
  return initial;
}

async function kvSet(key: string, value: unknown): Promise<void> {
  if (!import.meta.env.VITE_KV_REST_API_URL || !import.meta.env.VITE_KV_REST_API_TOKEN) {
    return;
  }
  try {
    await fetch(`${import.meta.env.VITE_KV_REST_API_URL}/set/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_KV_REST_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    });
  } catch {
    /* ignore network errors */
  }
}

export function useSyncedStorage<T>(key: StorageKey, initial: T) {
  const [value, setValue] = useState<T>(() => getLocal(key, initial));
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setSyncing(true);
      const remote = await kvGet(key, initial);
      if (mounted) {
        const merged = typeof remote === "object" && remote !== null
          ? { ...(remote as Record<string, unknown>), ...(value as Record<string, unknown>) } as T
          : remote;
        setValue(merged);
        setLocal(key, merged);
        setSynced(true);
      }
      setSyncing(false);
    })();
    return () => { mounted = false; };
  }, [key, initial, value]);

  const setter = useCallback((updater: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater;
      setLocal(key, next);
      kvSet(key, next);
      return next;
    });
  }, [key]);

  return [value, setter, { synced, syncing }] as const;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const storageKey = key as StorageKey;
  const [value, setter] = useSyncedStorage(storageKey, initial);
  return [value, setter] as const;
}

export function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = target.getTime() - now;
  const abs = Math.max(0, diff);
  return {
    passed: diff <= 0,
    days: Math.floor(abs / 86400000),
    hours: Math.floor((abs % 86400000) / 3600000),
    minutes: Math.floor((abs % 3600000) / 60000),
    seconds: Math.floor((abs % 60000) / 1000),
  };
}

export function exportData() {
  const data = {
    done: getLocal("done", {}),
    dod: getLocal("dod", {}),
    names: getLocal("names", {}),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bad-rabbit-roadmap-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(json: string) {
  try {
    const data = JSON.parse(json);
    if (data.done) setLocal("done", data.done);
    if (data.dod) setLocal("dod", data.dod);
    if (data.names) setLocal("names", data.names);
    window.location.reload();
  } catch (e) {
    throw new Error("Invalid backup file");
  }
}