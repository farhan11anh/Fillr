<script lang="ts" setup>
import { useModeSwitcher } from '@/composables/useModeSwitcher';
import AutofillMode from '@/modes/autofill/AutofillMode.vue';
import DevToolsMode from '@/modes/devtools/DevToolsMode.vue';

const { activeMode } = useModeSwitcher();
</script>

<template>
  <div class="popup-container">
    <header class="header">
      <h1>FillrKit</h1>
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
    </header>
    
    <main class="content">
      <AutofillMode v-if="activeMode === 'autofill'" />
      <DevToolsMode v-else />
    </main>
  </div>
</template>

<style scoped>
.popup-container {
  width: 400px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  font-family: sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.header h1 {
  margin: 0;
  font-size: 1.2rem;
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
}
</style>
