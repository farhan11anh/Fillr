<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useModeSwitcher } from '@/composables/useModeSwitcher';
import AutofillMode from '@/modes/autofill/AutofillMode.vue';
import DevToolsMode from '@/modes/devtools/DevToolsMode.vue';

const { activeMode } = useModeSwitcher();
const appVersion = ref('');
const currentTheme = ref<'auto' | 'light' | 'dark'>('auto');

const applyTheme = (theme: string) => {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  } else if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('light', 'dark');
  }
};

const toggleTheme = async () => {
  const next = currentTheme.value === 'auto' ? 'dark' : (currentTheme.value === 'dark' ? 'light' : 'auto');
  currentTheme.value = next;
  applyTheme(next);
  await chrome.storage.local.set({ fillkit_theme: next });
};

onMounted(async () => {
  const manifest = chrome.runtime.getManifest();
  appVersion.value = manifest.version_name || manifest.version || '1.0.0';
  
  const data = await chrome.storage.local.get(['fillkit_theme']);
  if (data.fillkit_theme) {
    currentTheme.value = data.fillkit_theme;
    applyTheme(currentTheme.value);
  }
});
</script>

<template>
  <div class="popup-container">
    <header class="header">
      <div class="title-container">
        <h1>FillrKit</h1>
        <span class="version-badge">v{{ appVersion }}</span>
      </div>
      <div class="header-right">
        <button class="theme-toggle" @click="toggleTheme" :title="'Tema saat ini: ' + currentTheme">
          {{ currentTheme === 'dark' ? '🌙' : (currentTheme === 'light' ? '☀️' : '💻') }}
        </button>
        <div class="switcher">
        <button 
          :class="{ active: activeMode === 'autofill' }" 
          @click="activeMode = 'autofill'"
        >
          Autofill
        </button>
        <button 
          :class="{ active: activeMode === 'devtools' }" 
          @click="activeMode = 'devtools'"
        >
          Dev Tools
        </button>
        </div>
      </div>
    </header>
    
    <main class="content">
      <KeepAlive>
        <component :is="activeMode === 'autofill' ? AutofillMode : DevToolsMode" />
      </KeepAlive>
    </main>
  </div>
</template>

<style scoped>
.popup-container {
  width: 400px;
  min-height: 400px;
  max-height: 550px;
  display: flex;
  flex-direction: column;
  font-family: sans-serif;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-toggle {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 1rem;
  color: var(--text);
  transition: all 0.2s;
}

.theme-toggle:hover {
  background: var(--surface);
  border-color: var(--accent);
}

.header h1 {
  margin: 0;
  font-size: 1.2rem;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.version-badge {
  font-size: 0.7rem;
  background-color: var(--accent);
  color: white;
  padding: 0.1rem 0.4rem;
  border-radius: 12px;
  font-weight: bold;
}

.switcher {
  display: flex;
  gap: 4px;
  background: var(--surface);
  padding: 4px;
  border-radius: 6px;
}

.switcher button {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.switcher button.active {
  background: var(--bg);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.content {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
}
</style>
