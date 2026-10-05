<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getScriptableTabs } from '@/utils/tabHelpers';
import type { TabInfo } from '@/utils/tabHelpers';
import { transferLocalStorage } from '@/utils/transferCoordinator';
import type { StepStatus } from '@/utils/transferCoordinator';

const tabs = ref<TabInfo[]>([]);
const sourceTabId = ref<number | null>(null);
const destTabId = ref<number | null>(null);

const currentStep = ref<number>(0);
const stepStatus = ref<StepStatus>('waiting');
const errorMessage = ref<string>('');
const isTransferring = computed(() => currentStep.value > 0 && stepStatus.value === 'running');

const isSameTab = computed(() => {
  return sourceTabId.value !== null && sourceTabId.value === destTabId.value;
});

const canTransfer = computed(() => {
  return sourceTabId.value !== null && destTabId.value !== null && !isSameTab.value && !isTransferring.value;
});

onMounted(async () => {
  tabs.value = await getScriptableTabs();
  if (tabs.value.length > 0) {
    sourceTabId.value = tabs.value[0].id;
    if (tabs.value.length > 1) {
      destTabId.value = tabs.value[1].id;
    } else {
      destTabId.value = tabs.value[0].id; // Let it be same for now, but disable button
    }
  }
});

const handleTransfer = async () => {
  if (!canTransfer.value) return;

  const sourceTab = tabs.value.find(t => t.id === sourceTabId.value)!;
  const destTab = tabs.value.find(t => t.id === destTabId.value)!;

  currentStep.value = 1;
  stepStatus.value = 'running';
  errorMessage.value = '';

  await transferLocalStorage(sourceTab, destTab, (step, status, message) => {
    currentStep.value = step;
    stepStatus.value = status;
    if (message && status === 'failed') {
      errorMessage.value = message;
    }
  });
};

const getStepClass = (stepNumber: number) => {
  if (currentStep.value < stepNumber) return 'waiting';
  if (currentStep.value === stepNumber) {
    return stepStatus.value;
  }
  return currentStep.value > stepNumber ? 'success' : 'waiting';
};
</script>

<template>
  <div class="localstorage-transfer">
    <h3>Transfer localStorage</h3>
    
    <div class="controls">
      <div class="form-group">
        <label>Tab Sumber:</label>
        <select v-model="sourceTabId" :disabled="isTransferring">
          <option v-for="tab in tabs" :key="tab.id" :value="tab.id">
            {{ tab.title }} ({{ tab.origin }})
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Tab Tujuan:</label>
        <select v-model="destTabId" :disabled="isTransferring">
          <option v-for="tab in tabs" :key="tab.id" :value="tab.id">
            {{ tab.title }} ({{ tab.origin }})
          </option>
        </select>
      </div>
      
      <p class="error-text" v-if="isSameTab">Tab sumber dan tujuan tidak boleh sama.</p>

      <button 
        class="transfer-btn" 
        :disabled="!canTransfer" 
        @click="handleTransfer"
      >
        {{ isTransferring ? 'Memproses...' : 'Transfer' }}
      </button>
    </div>

    <div class="progress-box" v-if="currentStep > 0">
      <div class="step" :class="getStepClass(1)">1. Clear Destination</div>
      <div class="step" :class="getStepClass(2)">2. Reload Destination</div>
      <div class="step" :class="getStepClass(3)">3. Transfer Data</div>
      <div class="step" :class="getStepClass(4)">4. Reload Final</div>
      
      <p class="error-msg" v-if="errorMessage">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.localstorage-transfer {
  margin-top: 1rem;
  padding: 1rem;
  background-color: var(--surface);
  border-radius: 6px;
  border: 1px solid var(--border);
}
.form-group {
  margin-bottom: 0.8rem;
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 0.3rem;
  font-weight: 500;
  font-size: 0.9rem;
}
select {
  padding: 0.4rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background-color: var(--bg);
  color: var(--text);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
}
.error-text {
  color: var(--danger);
  font-size: 0.85rem;
  margin: 0.2rem 0;
}
.transfer-btn {
  width: 100%;
  padding: 0.6rem;
  background-color: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 0.5rem;
}
.transfer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.transfer-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
}

.progress-box {
  margin-top: 1rem;
  padding: 0.8rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
}
.step {
  padding: 0.3rem 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}
.step.running {
  color: var(--accent);
  font-weight: bold;
}
.step.success {
  color: var(--success);
}
.step.failed {
  color: var(--danger);
}
.error-msg {
  margin-top: 0.8rem;
  color: var(--danger);
  font-size: 0.85rem;
  background: var(--surface);
  border: 1px solid var(--danger);
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
