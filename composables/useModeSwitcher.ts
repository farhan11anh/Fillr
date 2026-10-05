import { ref, watch, onMounted } from 'vue';

export type ExtensionMode = 'autofill' | 'devtools';

export function useModeSwitcher() {
  const activeMode = ref<ExtensionMode>('autofill');
  const isLoaded = ref(false);

  // Load initial state
  onMounted(async () => {
    try {
      const result = await chrome.storage.local.get('fillrkit_active_mode');
      if (result.fillrkit_active_mode) {
        activeMode.value = result.fillrkit_active_mode as ExtensionMode;
      }
    } catch (e) {
      console.error('Failed to load mode from storage', e);
    } finally {
      isLoaded.value = true;
    }
  });

  // Watch for changes and save to storage
  watch(activeMode, async (newMode) => {
    if (isLoaded.value) {
      try {
        await chrome.storage.local.set({ fillrkit_active_mode: newMode });
      } catch (e) {
        console.error('Failed to save mode to storage', e);
      }
    }
  });

  return {
    activeMode,
    isLoaded,
  };
}
