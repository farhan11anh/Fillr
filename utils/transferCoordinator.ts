import { browser } from 'wxt/browser';
import type { TabInfo } from './tabHelpers';
import { getLocalStorageSnapshot, clearLocalStorageAndLog, setLocalStorageAndLog, logFinalReload } from './localStorageScripts';

export type StepStatus = 'waiting' | 'running' | 'success' | 'failed';

export interface ProgressCallback {
  (step: number, status: StepStatus, message?: string): void;
}

export async function transferLocalStorage(
  sourceTab: TabInfo,
  destTab: TabInfo,
  onProgress: ProgressCallback
): Promise<void> {
  if (sourceTab.id === destTab.id) {
    onProgress(1, 'failed', 'Tab sumber dan tujuan tidak boleh sama.');
    return;
  }

  // Request permissions
  try {
    const granted = await browser.permissions.request({
      origins: [`${sourceTab.origin}/*`, `${destTab.origin}/*`]
    });
    if (!granted) {
      onProgress(1, 'failed', 'Permission ditolak oleh user.');
      return;
    }
  } catch (e: any) {
    onProgress(1, 'failed', 'Gagal meminta permission: ' + e.message);
    return;
  }

  // 1. Get snapshot from source
  let snapshot: Record<string, string> = {};
  try {
    const results = await browser.scripting.executeScript({
      target: { tabId: sourceTab.id },
      func: getLocalStorageSnapshot,
    });
    snapshot = results[0]?.result || {};
  } catch (e: any) {
    onProgress(1, 'failed', 'Gagal membaca localStorage dari sumber: ' + e.message);
    return;
  }

  const keyCount = Object.keys(snapshot).length;
  if (keyCount === 0) {
    const confirm = window.confirm(`LocalStorage di tab sumber kosong. Yakin ingin meng-clear localStorage di tab tujuan (${destTab.origin})?`);
    if (!confirm) {
      onProgress(1, 'failed', 'Dibatalkan oleh pengguna karena sumber kosong.');
      return;
    }
  }

  // Step 1: Clear
  onProgress(1, 'running');
  try {
    await browser.scripting.executeScript({
      target: { tabId: destTab.id },
      func: clearLocalStorageAndLog,
      args: [destTab.origin]
    });
    console.log(`[Fillkit] (1/4) localStorage cleared di ${destTab.origin}`);
    onProgress(1, 'success');
  } catch (e: any) {
    console.error('Langkah 1 gagal:', e);
    onProgress(1, 'failed', 'Gagal clear localStorage: ' + e.message);
    return;
  }

  // Step 2: Reload
  onProgress(2, 'running');
  try {
    await reloadTabAndWait(destTab.id, destTab.origin);
    console.log(`[Fillkit] (2/4) tab tujuan selesai reload`);
    onProgress(2, 'success');
  } catch (e: any) {
    console.error('Langkah 2 gagal:', e);
    onProgress(2, 'failed', 'Gagal reload tab tujuan: ' + e.message);
    return;
  }

  // Step 3: Write
  onProgress(3, 'running');
  try {
    await browser.scripting.executeScript({
      target: { tabId: destTab.id },
      func: setLocalStorageAndLog,
      args: [snapshot, sourceTab.origin, destTab.origin]
    });
    console.log(`[Fillkit] (3/4) transfer selesai: ${keyCount} key dari ${sourceTab.origin} ke ${destTab.origin}`);
    onProgress(3, 'success');
  } catch (e: any) {
    console.error('Langkah 3 gagal:', e);
    onProgress(3, 'failed', 'Gagal menulis ke localStorage tujuan: ' + e.message);
    return;
  }

  // Step 4: Reload
  onProgress(4, 'running');
  try {
    await reloadTabAndWait(destTab.id, destTab.origin);
    
    // Log final reload
    await browser.scripting.executeScript({
      target: { tabId: destTab.id },
      func: logFinalReload,
    });
    
    console.log(`[Fillkit] (4/4) reload akhir selesai, transfer localStorage berhasil`);
    onProgress(4, 'success');
  } catch (e: any) {
    console.error('Langkah 4 gagal:', e);
    onProgress(4, 'failed', 'Gagal reload akhir tab tujuan: ' + e.message);
    return;
  }
}

function reloadTabAndWait(tabId: number, expectedOrigin: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const listener = (updatedTabId: number, changeInfo: any, tab: any) => {
      if (updatedTabId === tabId) {
        if (tab.url) {
          try {
            const currentOrigin = new URL(tab.url).origin;
            if (currentOrigin !== expectedOrigin) {
              browser.tabs.onUpdated.removeListener(listener);
              clearTimeout(timeoutId);
              reject(new Error(`Origin berubah dari ${expectedOrigin} menjadi ${currentOrigin}. Transfer dihentikan.`));
              return;
            }
          } catch (e) {
            // invalid URL parsing
          }
        }
        
        if (changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(listener);
          clearTimeout(timeoutId);
          resolve();
        }
      }
    };

    browser.tabs.onUpdated.addListener(listener);
    browser.tabs.reload(tabId);

    timeoutId = setTimeout(() => {
      browser.tabs.onUpdated.removeListener(listener);
      reject(new Error('Timeout 15 detik tercapai saat menunggu reload.'));
    }, 15000);
  });
}
