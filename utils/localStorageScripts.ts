export function getLocalStorageSnapshot(): Record<string, string> {
  const snapshot: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      snapshot[key] = localStorage.getItem(key) || '';
    }
  }
  return snapshot;
}

export function clearLocalStorageAndLog(origin: string): void {
  localStorage.clear();
  console.log(`[Fillkit] (1/4) localStorage cleared di ${origin}`);
}

export function setLocalStorageAndLog(snapshot: Record<string, string>, sourceOrigin: string, destOrigin: string): void {
  const keys = Object.keys(snapshot);
  for (const key of keys) {
    localStorage.setItem(key, snapshot[key]);
  }
  console.log(`[Fillkit] (3/4) transfer selesai: ${keys.length} key dari ${sourceOrigin} ke ${destOrigin}`);
}

export function logFinalReload(): void {
  console.log(`[Fillkit] (4/4) reload akhir selesai, transfer localStorage berhasil`);
}
