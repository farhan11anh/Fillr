import { extractFormFields } from '@/utils/savedForm';


export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'runtime',
  async main() {
    const data = await chrome.storage.local.get(['fillkit_debug_mode']);
    const debugMode = data.fillkit_debug_mode || false;
    return extractFormFields(debugMode);
  },
});
