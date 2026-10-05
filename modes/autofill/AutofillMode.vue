<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSavedFormFields, saveFormFields } from '@/utils/savedForm';
import type { SavedFormField } from '@/utils/savedForm';

const currentUrl = ref<{origin: string, pathname: string, hash: string} | null>(null);
const savedFields = ref<SavedFormField[]>([]);
const editingFieldIndex = ref<number | null>(null);
const editValue = ref<string>('');
const isDebugMode = ref<boolean>(false);
const showCopyToast = ref<boolean>(false);

onMounted(async () => {
  const debugData = await chrome.storage.local.get(['fillkit_debug_mode']);
  isDebugMode.value = debugData.fillkit_debug_mode || false;
  
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.startsWith('http')) {
    const url = new URL(tab.url);
    currentUrl.value = { origin: url.origin, pathname: url.pathname, hash: url.hash };
    await loadSavedFields();
  }
});

const loadSavedFields = async () => {
  if (!currentUrl.value) return;
  savedFields.value = await getSavedFormFields(currentUrl.value.origin, currentUrl.value.pathname, currentUrl.value.hash);
};

const saveForm = async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id || !currentUrl.value) return;

  try {
    const [result] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['/content-scripts/extractForm.js']
    });
    
    if (result && result.result) {
      await saveFormFields(currentUrl.value.origin, currentUrl.value.pathname, currentUrl.value.hash, result.result);
      await loadSavedFields();
      
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
  if (!currentUrl.value) return;
  savedFields.value.splice(index, 1);
  await saveFormFields(currentUrl.value.origin, currentUrl.value.pathname, currentUrl.value.hash, savedFields.value);
  if (savedFields.value.length === 0) {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) browser.action.setBadgeText({ text: '', tabId: tab.id });
  }
};

const startEdit = (index: number) => {
  editingFieldIndex.value = index;
  editValue.value = savedFields.value[index].value;
};

const saveEdit = async () => {
  if (!currentUrl.value || editingFieldIndex.value === null) return;
  savedFields.value[editingFieldIndex.value].value = editValue.value;
  await saveFormFields(currentUrl.value.origin, currentUrl.value.pathname, currentUrl.value.hash, savedFields.value);
  editingFieldIndex.value = null;
};

const cancelEdit = () => {
  editingFieldIndex.value = null;
};

const clearAll = async () => {
  if (!currentUrl.value) return;
  savedFields.value = [];
  await saveFormFields(currentUrl.value.origin, currentUrl.value.pathname, currentUrl.value.hash, []);
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
      <h3>Form Tersimpan</h3>
      <div class="actions">
        <button class="btn secondary" @click="saveForm">Simpan form</button>
        <button class="btn primary" @click="fillSaved" :disabled="savedFields.length === 0">Isi form</button>
      </div>

      <div class="status">
        <span v-if="savedFields.length > 0">Tersimpan {{ savedFields.length }} field</span>
        <span v-else>Belum ada form tersimpan untuk halaman ini.</span>
        
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
