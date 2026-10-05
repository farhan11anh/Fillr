export default defineBackground(() => {
  console.log('Background service worker started.');

  browser.commands.onCommand.addListener(async (command) => {
    if (command === 'fill-form') {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        try {
          await browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['/content-scripts/fillSavedForm.js'],
          });
        } catch (error) {
          console.error('Failed to execute autofill script', error);
        }
      }
    }
  });

  const checkBadgeVisibility = async (tabId: number, url?: string) => {
    if (!url || !url.startsWith('http')) return;
    try {
      const parsedUrl = new URL(url);
      const { getSavedFormFields } = await import('@/utils/savedForm');
      const fields = await getSavedFormFields(parsedUrl.origin, parsedUrl.pathname, parsedUrl.hash);
      if (fields && fields.length > 0) {
        await browser.action.setBadgeText({ text: '★', tabId });
        await browser.action.setBadgeBackgroundColor({ color: '#4caf50', tabId });
      } else {
        await browser.action.setBadgeText({ text: '', tabId });
      }
    } catch (error) {
      console.error('Error checking badge visibility', error);
    }
  };

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.status === 'complete') {
      checkBadgeVisibility(tabId, tab.url);
    }
  });

  browser.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
    if (details.frameId === 0) { // Main frame
      checkBadgeVisibility(details.tabId, details.url);
    }
  });
});
