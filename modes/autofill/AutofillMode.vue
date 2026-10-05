<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getFormScenarios, saveFormScenarios } from '@/utils/savedForm';
import type { SavedFormField, ScenarioStore, Scenario } from '@/utils/savedForm';

const currentUrl = ref<{origin: string, pathname: string, hash: string} | null>(null);
const store = ref<ScenarioStore | null>(null);

const editingFieldIndex = ref<number | null>(null);
const editValue = ref<string>('');
const isDebugMode = ref<boolean>(false);
const showCopyToast = ref<boolean>(false);

const activeScenario = computed(() => {
  if (!store.value) return null;
  return store.value.scenarios.find(s => s.id === store.value?.activeScenarioId) || store.value.scenarios[0];
});

const savedFields = computed(() => {
  return activeScenario.value ? activeScenario.value.fields : [];
});

onMounted(async () => {
  const debugData = await chrome.storage.local.get(['fillkit_debug_mode']);
  isDebugMode.value = debugData.fillkit_debug_mode || false;
  
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.startsWith('http')) {
    const url = new URL(tab.url);
    currentUrl.value = { origin: url.origin, pathname: url.pathname, hash: url.hash };
    await loadStore();
  }
});

const loadStore = async () => {
  if (!currentUrl.value) return;
  store.value = await getFormScenarios(currentUrl.value.origin, currentUrl.value.pathname, currentUrl.value.hash);
};

const saveStore = async () => {
  if (!currentUrl.value || !store.value) return;
  await saveFormScenarios(currentUrl.value.origin, currentUrl.value.pathname, currentUrl.value.hash, store.value);
};

const changeScenario = async (id: string) => {
  if (!store.value) return;
  store.value.activeScenarioId = id;
  await saveStore();
};

const addScenario = async () => {
  if (!store.value) return;
  const name = prompt('Nama skenario baru:', `Skenario ${store.value.scenarios.length + 1}`);
  if (!name) return;
  
  const newId = `sc_${Date.now()}`;
  store.value.scenarios.push({ id: newId, name, fields: [] });
  store.value.activeScenarioId = newId;
  await saveStore();
};

const renameScenario = async () => {
  if (!activeScenario.value || !store.value) return;
  const name = prompt('Ubah nama skenario:', activeScenario.value.name);
  if (name && name.trim()) {
    activeScenario.value.name = name.trim();
    await saveStore();
  }
};

const deleteScenario = async () => {
  if (!store.value || store.value.scenarios.length <= 1) {
    alert('Tidak bisa menghapus skenario terakhir.');
    return;
  }
  if (!confirm(`Hapus skenario "${activeScenario.value?.name}"?`)) return;
  
  store.value.scenarios = store.value.scenarios.filter(s => s.id !== store.value!.activeScenarioId);
  store.value.activeScenarioId = store.value.scenarios[0].id;
  await saveStore();
};

const saveForm = async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id || !currentUrl.value || !activeScenario.value || !store.value) return;

  try {
    const [result] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['/content-scripts/extractForm.js']
    });
    
    if (result && result.result) {
      activeScenario.value.fields = result.result;
      await saveStore();
      
      // Update badge
      browser.action.setBadgeText({ text: '★', tabId: tab.id });
      browser.action.setBadgeBackgroundColor({ color: '#4caf50', tabId: tab.id });
    }
  } catch (error) {
    console.error('Failed to extract form fields', error);
  }
};

const fillSaved = async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id || savedFields.value.length === 0) return;

  try {
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['/content-scripts/fillSavedForm.js'],
    });
  } catch (error) {
    console.error('Failed to execute fill saved script', error);
  }
};

const removeField = async (index: number) => {
  if (!activeScenario.value) return;
  activeScenario.value.fields.splice(index, 1);
  await saveStore();
  if (activeScenario.value.fields.length === 0) {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) browser.action.setBadgeText({ text: '', tabId: tab.id });
  }
};

const startEdit = (index: number) => {
  editingFieldIndex.value = index;
  editValue.value = savedFields.value[index].value;
};

const saveEdit = async () => {
  if (!activeScenario.value || editingFieldIndex.value === null) return;
  activeScenario.value.fields[editingFieldIndex.value].value = editValue.value;
  await saveStore();
  editingFieldIndex.value = null;
};

const cancelEdit = () => {
  editingFieldIndex.value = null;
};

const clearAll = async () => {
  if (!activeScenario.value) return;
  activeScenario.value.fields = [];
  await saveStore();
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) browser.action.setBadgeText({ text: '', tabId: tab.id });
};

const toggleDebugMode = async () => {
  await chrome.storage.local.set({ fillkit_debug_mode: isDebugMode.value });
};

const copyDebugLogs = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    
    const logs = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id as number, { type: 'GET_DEBUG_LOGS' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
    
    const jsonStr = JSON.stringify(logs, null, 2);
    await navigator.clipboard.writeText(jsonStr);
    
    showCopyToast.value = true;
    setTimeout(() => {
      showCopyToast.value = false;
    }, 3000);
  } catch (err: any) {
    console.error('Failed to copy debug logs', err);
    alert(`Failed to copy logs: ${err.message}`);
  }
};

</script>

<template>
  <div class="autofill-mode">
    <div class="debug-toast" v-if="showCopyToast">Log disalin!</div>
    <div class="section debug-settings">
      <label class="toggle-label">
        <input type="checkbox" v-model="isDebugMode" @change="toggleDebugMode">
        Mode debug
      </label>
      <button class="btn secondary small-btn" v-if="isDebugMode" @click="copyDebugLogs">Salin log debug</button>
    </div>

    <div class="section saved-fill">
      <div class="scenario-header">
        <h3>Skenario Form</h3>
        <div class="scenario-controls" v-if="store && store.scenarios">
          <select 
            :value="store.activeScenarioId" 
            @change="(e) => changeScenario((e.target as HTMLSelectElement).value)"
            class="scenario-select"
          >
            <option v-for="scen in store.scenarios" :key="scen.id" :value="scen.id">
              {{ scen.name }}
            </option>
          </select>
          <button class="icon-btn" @click="addScenario" title="Tambah Skenario">➕</button>
          <button class="icon-btn" @click="renameScenario" title="Ubah Nama">✎</button>
          <button class="icon-btn delete" @click="deleteScenario" title="Hapus Skenario" :disabled="!store || store.scenarios.length <= 1">🗑</button>
        </div>
      </div>

      <div class="actions mt-2">
        <button class="btn secondary" @click="saveForm">Simpan form ke skenario ini</button>
        <button class="btn primary" @click="fillSaved" :disabled="savedFields.length === 0">Isi form dengan skenario ini</button>
      </div>

      <div class="status mt-2">
        <span v-if="savedFields.length > 0">Tersimpan {{ savedFields.length }} field pada skenario ini</span>
        <span v-else>Skenario ini masih kosong (belum ada field tersimpan).</span>
        
        <button v-if="savedFields.length > 0" class="btn text-danger btn-clear" @click="clearAll">Clear All</button>
      </div>

      <div class="fields-list" v-if="savedFields.length > 0">
        <div class="field-item" v-for="(field, idx) in savedFields" :key="idx">
          <div class="field-info">
            <div class="field-name" :title="field.label || field.name || field.id">
              {{ field.label || field.name || field.id || ('Field ' + idx) }}
            </div>
            
            <div class="field-value" v-if="editingFieldIndex !== idx" :title="field.value" @dblclick="startEdit(idx)">
              {{ field.value }}
            </div>
            <div class="field-edit" v-else>
              <input type="text" v-model="editValue" @keyup.enter="saveEdit" @keyup.esc="cancelEdit" autofocus />
              <button class="icon-btn save" @click="saveEdit">✓</button>
              <button class="icon-btn cancel" @click="cancelEdit">✗</button>
            </div>
          </div>
          <div class="field-actions" v-if="editingFieldIndex !== idx">
            <button class="icon-btn edit" @click="startEdit(idx)" title="Edit">✎</button>
            <button class="icon-btn delete" @click="removeField(idx)" title="Hapus">🗑</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.autofill-mode {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
h3 {
  margin: 0;
  font-size: 1.1rem;
}


.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}
.scenario-controls {
  display: flex;
  gap: 0.2rem;
  align-items: center;
}
.scenario-select {
  padding: 0.2rem 0.4rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.85rem;
  max-width: 150px;
}
.mt-2 {
  margin-top: 0.5rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.status {
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-clear {
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  width: auto;
  background: transparent;
  border: 1px solid var(--danger);
  color: var(--danger);
}
.btn-clear:hover {
  background: var(--danger);
  color: #ffffff;
}
.fields-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
}
.field-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid var(--border);
  align-items: center;
}
.field-item:last-child {
  border-bottom: none;
}
.field-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.field-name {
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.field-value {
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: text;
}
.field-edit {
  display: flex;
  gap: 0.2rem;
  align-items: center;
}
.field-edit input {
  flex: 1;
  min-width: 0;
  padding: 0.2rem;
  border: 1px solid var(--accent);
  border-radius: 2px;
  background: var(--bg);
  color: var(--text);
}
.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  font-size: 1rem;
  line-height: 1;
  color: var(--text-muted);
}
.icon-btn:hover {
  color: var(--text);
}
.icon-btn.delete:hover {
  color: var(--danger);
}
.icon-btn.save:hover {
  color: var(--success);
}
.icon-btn.cancel:hover {
  color: var(--danger);
}
.debug-settings {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}
.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
}
.small-btn {
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
}
.debug-toast {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--success);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  animation: fadein 0.3s;
  z-index: 1000;
}
@keyframes fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
