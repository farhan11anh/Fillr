import { browser } from 'wxt/browser';

export interface TabInfo {
  id: number;
  title: string;
  url: string;
  origin: string;
  favIconUrl?: string;
}

export async function getScriptableTabs(): Promise<TabInfo[]> {
  const tabs = await browser.tabs.query({});
  
  return tabs
    .filter(tab => {
      if (!tab.id || !tab.url) return false;
      
      const url = tab.url.toLowerCase();
      // Filter out non-scriptable URLs
      if (url.startsWith('chrome://') || 
          url.startsWith('edge://') || 
          url.startsWith('about:') ||
          url.startsWith('https://chrome.google.com/webstore') ||
          url.startsWith('https://chromewebstore.google.com/')) {
        return false;
      }
      
      return true;
    })
    .map(tab => {
      let origin = '';
      try {
        const urlObj = new URL(tab.url!);
        origin = urlObj.origin;
      } catch (e) {
        origin = tab.url!;
      }
      
      return {
        id: tab.id!,
        title: tab.title || tab.url!,
        url: tab.url!,
        origin,
        favIconUrl: tab.favIconUrl
      };
    });
}
