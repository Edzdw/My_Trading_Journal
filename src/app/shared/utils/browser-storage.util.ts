export function readStorageItem(storage: Storage | null, key: string): string | null {
  return storage?.getItem(key) ?? null;
}

export function writeStorageItem(storage: Storage | null, key: string, value: string): void {
  storage?.setItem(key, value);
}

export function removeStorageItem(storage: Storage | null, key: string): void {
  storage?.removeItem(key);
}
