

export interface ReadResult {
  value: string | string[];
  optionValue?: string | string[];
  optionLabel?: string | string[];
}

export interface FieldAdapter {
  name: string;
  detect: (element: Element) => boolean;
  read: (element: Element) => string | string[] | ReadResult;
  write: (element: Element, value: any) => Promise<void>;
}

import { callVueRpc } from './vueRpc';
import { dlog } from './debug';

export const NativeSelectAdapter: FieldAdapter = {
  name: 'NativeSelect',
  detect: (element: Element) => element.tagName.toLowerCase() === 'select',
  read: (element: Element) => {
    const select = element as HTMLSelectElement;
    if (select.multiple) {
      const opts = Array.from(select.selectedOptions);
      return {
        value: opts.map(opt => opt.text.trim()),
        optionValue: opts.map(opt => opt.value),
        optionLabel: opts.map(opt => opt.text.trim())
      };
    }
    const opt = select.options[select.selectedIndex];
    return {
      value: opt?.text?.trim() || '',
      optionValue: opt?.value || '',
      optionLabel: opt?.text?.trim() || ''
    };
  },
  write: async (element: Element, data: any) => {
    const select = element as HTMLSelectElement;
    
    // Support passing either a string value, an array, or a SavedFormField object
    let valStr: string[] = [];
    let optionValues: string[] = [];
    let optionLabels: string[] = [];
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      valStr = data.value ? data.value.split(',') : [];
      optionValues = data.optionValue ? data.optionValue.split(',') : [];
      optionLabels = data.optionLabel ? data.optionLabel.split(',') : [];
    } else {
      const v = Array.isArray(data) ? data : [data];
      valStr = v.filter(Boolean).map(String);
    }
    
    let changed = false;

    for (let i = 0; i < select.options.length; i++) {
      const option = select.options[i];
      if (!option) continue;
      const optVal = option.value;
      const optText = option.text.trim();
      
      let shouldSelect = false;
      if (optionValues.length > 0 && optionValues.includes(optVal)) {
        shouldSelect = true;
      } else if (optionLabels.length > 0 && optionLabels.includes(optText)) {
        shouldSelect = true;
      } else if (valStr.includes(optText) || valStr.includes(optVal)) {
        shouldSelect = true;
      }
      
      if (option.selected !== shouldSelect) {
        option.selected = shouldSelect;
        changed = true;
      }
    }

    if (changed) {
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('blur', { bubbles: true }));
    }
  }
};

export const QuasarSelectAdapter: FieldAdapter = {
  name: 'QuasarSelect',
  detect: (element: Element) => element.classList.contains('q-select'),
  read: (element: Element) => {
    // For multiple select, quasar uses chips or comma separated text
    const chips = element.querySelectorAll('.q-chip__content');
    if (chips.length > 0) {
      return Array.from(chips).map(chip => chip.textContent?.trim() || '');
    }
    const innerText = element.querySelector('.q-field__native')?.textContent?.trim() || '';
    if (innerText && innerText !== 'add') return innerText; // Sometimes empty select shows 'add' or placeholder
    return '';
  },
  write: async (element: Element, data: any) => {
    let valStr: string[] = [];
    let optionValues: string[] = [];
    let optionLabels: string[] = [];
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      valStr = data.value ? data.value.split(',') : [];
      optionValues = data.optionValue ? data.optionValue.split(',') : [];
      optionLabels = data.optionLabel ? data.optionLabel.split(',') : [];
    } else {
      const v = Array.isArray(data) ? data : [data];
      valStr = v.filter(Boolean).map(String);
    }
    
    const count = Math.max(valStr.length, optionLabels.length, optionValues.length);
    if (count === 0) return;
    
    // 1. Try Vue instance setter first if modelValue is present
    let modelValue = data?.modelValue;
    const debugMode = data?.__debugMode;
    
    if (modelValue !== undefined && modelValue !== null) {
      if (debugMode) dlog('QuasarSelectAdapter', 'info', 'Attempting vue-instance write', { candidates: valStr });
      try {
        const originalId = element.id;
        const tempId = `fillr_temp_${Math.random().toString(36).substr(2, 9)}`;
        element.id = tempId;
        await callVueRpc('SET_MODEL', tempId, modelValue);
        if (originalId) {
          element.id = originalId;
        } else {
          element.removeAttribute('id');
        }
        if (debugMode) dlog('QuasarSelectAdapter', 'info', `vue-instance write success`);
        console.log(`[Fillr] Fill success via vue-instance for Quasar select`);
        
        // Wait a bit for rendering
        await new Promise(r => setTimeout(r, 150));
        
        // Verify
        const currentRead = QuasarSelectAdapter.read(element);
        const normalize = (t: string | undefined) => (t || '').toLowerCase().replace(/\s+/g, ' ').trim();
        const normCandidates = [optionLabels[0], optionValues[0], valStr[0]].filter(Boolean).map(c => normalize(c as string));
        
        let verifySuccess = false;
        if (Array.isArray(currentRead)) {
           verifySuccess = currentRead.some(r => normCandidates.some(c => normalize(r) === c || normalize(r).includes(c)));
        } else {
           verifySuccess = normCandidates.some(c => normalize(currentRead as string) === c || normalize(currentRead as string).includes(c));
        }
        
        if (verifySuccess) {
          return;
        } else {
          if (debugMode) dlog('QuasarSelectAdapter', 'warn', `vue-instance verification failed. Fallback to click-label`, { currentRead, normCandidates });
          console.warn(`[Fillr] vue-instance fill verification failed. Fallback to click-label.`);
        }
      } catch (err: any) {
        if (debugMode) dlog('QuasarSelectAdapter', 'warn', `vue-instance fill failed: ${err.message}. Fallback to click-label`);
        console.warn(`[Fillr] vue-instance fill failed: ${err.message}. Fallback to click-label`);
      }
    }

    if (debugMode) dlog('QuasarSelectAdapter', 'info', 'Attempting native/click write', { candidates: valStr });

    // Simulate focus before clicking, as some dropdowns ignore clicks if not focused
    const targetClick = element.querySelector('.q-field__control') || element;
    const targetInputForFocus = element.querySelector('input') || targetClick;
    
    targetInputForFocus.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    targetInputForFocus.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    try { (targetInputForFocus as HTMLElement).focus(); } catch (e) {}
    
    // full native event sequence
    targetClick.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    targetClick.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    targetClick.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    targetClick.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    
    const inputEl = element.querySelector('input.q-field__input') as HTMLInputElement;

    for (let i = 0; i < count; i++) {
      const candidates = [optionLabels[i], optionValues[i], valStr[i]].filter(Boolean);
      if (candidates.length === 0) continue;
      
      const primaryVal = candidates[0]; // use for input typing

      if (inputEl) {
        inputEl.value = primaryVal as string;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      let menu: Element | null = null;
      const ariaControlsId = inputEl?.getAttribute('aria-controls') || element.getAttribute('aria-owns');
      
      const findMenu = () => {
        let m: Element | null = null;
        if (ariaControlsId) {
          m = document.getElementById(ariaControlsId);
          if (m) {
            const qMenu = m.closest('.q-menu') || m.querySelector('.q-menu');
            if (qMenu) m = qMenu;
          }
        }
        if (!m) {
          const menus = Array.from(document.querySelectorAll('.q-menu'));
          m = menus.find(menu => {
            const style = window.getComputedStyle(menu);
            return style.display !== 'none' && style.visibility !== 'hidden' && menu.getClientRects().length > 0;
          }) || null;
        }
        if (m) {
          const style = window.getComputedStyle(m);
          if (style.display !== 'none' && style.visibility !== 'hidden' && m.getClientRects().length > 0) {
            return m;
          }
        }
        return null;
      };

      const waitForMenuAndOptions = async (timeout: number, isRetry: boolean = false): Promise<{ menu: Element, options: Element[] }> => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          
          const check = () => {
            if (Date.now() - startTime > timeout) {
              reject(new Error(`Timeout waiting for dropdown menu for Quasar select`));
              return;
            }
            
            const m = findMenu();
            if (m) {
              // check if it's loading
              const isSearching = m.querySelector('.q-spinner') !== null || element.querySelector('.q-spinner') !== null;
              if (isSearching) {
                setTimeout(check, 250);
                return;
              }
              
              const opts = Array.from(m.querySelectorAll('.q-item'));
              const noDataText = m.textContent?.toLowerCase().trim() || '';
              const isNoData = opts.length === 0 || (opts.length === 1 && (noDataText.includes('tidak ada data') || noDataText.includes('no data')));
              
              if (isNoData) {
                // Not found yet. Maybe still async resolving? Or truly not found.
                // We'll retry a bit or if time is up, we throw.
                setTimeout(check, 250);
                return;
              }
              
              if (opts.length > 0) {
                resolve({ menu: m, options: opts });
                return;
              }
            }
            
            setTimeout(check, 250);
          };
          check();
        });
      };

      try {
        if (debugMode) dlog('QuasarSelectAdapter', 'info', `Waiting for menu to appear...`);
        const { menu: foundMenu, options } = await waitForMenuAndOptions(5000);
        menu = foundMenu;
      } catch (err: any) {
        // Fallback: clear input and search again without filter
        if (inputEl) {
          if (debugMode) dlog('QuasarSelectAdapter', 'warn', `Menu wait failed: ${err.message}. Retrying without filter`);
          console.warn('Fallback: clearing Quasar select filter and retrying...');
          inputEl.value = '';
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          try {
            const { menu: foundMenu } = await waitForMenuAndOptions(5000, true);
            menu = foundMenu;
          } catch (fallbackErr) {
            if (debugMode) dlog('QuasarSelectAdapter', 'error', `Menu fallback failed`);
            throw new Error(`Timeout waiting for dropdown menu options after fallback`);
          }
        } else {
          if (debugMode) dlog('QuasarSelectAdapter', 'error', `Menu wait failed, no input to fallback`);
          throw err;
        }
      }

      if (!menu) continue;
      await new Promise(r => setTimeout(r, 100)); // slight delay for render stability

      // Re-query options as they might have changed after fallback
      const options = Array.from(menu.querySelectorAll('.q-item'));
      
      const normalize = (t: string | undefined) => (t || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const normCandidates = candidates.map(c => normalize(c as string));
      
      // 1. Exact match
      let targetOption = options.find(opt => {
        const text = normalize(opt.querySelector('.q-item__label')?.textContent || opt.textContent || '');
        return normCandidates.includes(text);
      });
      
      // 2. Partial match
      if (!targetOption) {
        targetOption = options.find(opt => {
          const text = normalize(opt.querySelector('.q-item__label')?.textContent || opt.textContent || '');
          return normCandidates.some(c => text.includes(c) || c.includes(text));
        });
      }
      if (targetOption) {
        targetOption.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
        targetOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        targetOption.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        targetOption.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        if (debugMode) dlog('QuasarSelectAdapter', 'info', `Option clicked successfully`);
      } else {
        if (debugMode) dlog('QuasarSelectAdapter', 'error', `Option "${primaryVal}" not found in Quasar select`);
        throw new Error(`Option "${primaryVal}" not found in Quasar select`);
      }
      // Wait for rendering the new value
      await new Promise(r => setTimeout(r, 150));
      
      // Verify
      const currentRead = QuasarSelectAdapter.read(element);
      let verifySuccess = false;
      if (Array.isArray(currentRead)) {
         verifySuccess = currentRead.some(r => candidates.some(c => normalize(r) === normalize(c as string) || normalize(r).includes(normalize(c as string))));
      } else {
         verifySuccess = candidates.some(c => normalize(currentRead as string) === normalize(c as string) || normalize(currentRead as string).includes(normalize(c as string)));
      }
      
      if (!verifySuccess) {
         throw new Error(`Failed to verify filled value for Quasar select. Expected one of: ${candidates.join(', ')}. Got: ${currentRead}`);
      }
    }
    
    // Close menu and trigger blurs
    if (element.hasAttribute('multiple') || element.querySelector('.q-field__native')?.hasAttribute('multiple')) {
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
    
    // Simulate blur for inquiry triggers
    const blurTargetInput = element.querySelector('input') || element.querySelector('.q-field__control') || element;
    blurTargetInput.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    blurTargetInput.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    try { (blurTargetInput as HTMLElement).blur(); } catch(e) {}
    
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }
};

export const QuasarRadioAdapter: FieldAdapter = {
  name: 'QuasarRadio',
  detect: (element: Element) => element.classList.contains('q-radio'),
  read: (element: Element) => {
    if (!element.classList.contains('q-radio--checked') && element.getAttribute('aria-checked') !== 'true') return '';
    const input = element.querySelector('input[type="radio"]') as HTMLInputElement;
    if (input && input.value && input.value !== 'on') return input.value;
    const label = element.querySelector('.q-radio__label');
    return label?.textContent?.trim() || element.textContent?.trim() || '';
  },
  write: async (element: Element, data: any) => {
    if (!element.classList.contains('q-radio--checked') && element.getAttribute('aria-checked') !== 'true') {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  }
};

export const QuasarCheckboxAdapter: FieldAdapter = {
  name: 'QuasarCheckbox',
  detect: (element: Element) => element.classList.contains('q-checkbox'),
  read: (element: Element) => {
    if (!element.classList.contains('q-checkbox--truthy') && element.getAttribute('aria-checked') !== 'true') return '';
    const input = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (input && input.value && input.value !== 'on') return input.value;
    const label = element.querySelector('.q-checkbox__label');
    return label?.textContent?.trim() || element.textContent?.trim() || 'true';
  },
  write: async (element: Element, data: any) => {
    // Determine if it should be checked based on saved value
    let valStr = '';
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      valStr = data.value || '';
    } else {
      const v = Array.isArray(data) ? data[0] : data;
      valStr = String(v || '');
    }
    
    const isChecked = element.classList.contains('q-checkbox--truthy') || element.getAttribute('aria-checked') === 'true';
    if (valStr && !isChecked) {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    } else if (!valStr && isChecked) {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  }
};

export const QuasarBtnToggleAdapter: FieldAdapter = {
  name: 'QuasarBtnToggle',
  detect: (element: Element) => element.classList.contains('q-btn-toggle'),
  read: (element: Element) => {
    let activeBtn = element.querySelector('button[aria-pressed="true"]') || element.querySelector('button.q-btn--active') || element.querySelector('button.bg-primary') || element.querySelector('button.text-primary');
    return activeBtn?.textContent?.trim() || '';
  },
  write: async (element: Element, data: any) => {
    let valStr = '';
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      valStr = data.value || '';
    } else {
      const v = Array.isArray(data) ? data[0] : data;
      valStr = String(v || '');
    }
    if (!valStr) return;
    const btns = Array.from(element.querySelectorAll('button'));
    const normalize = (t: string) => t.toLowerCase().replace(/\s+/g, ' ').trim();
    const targetVal = normalize(valStr);
    const targetBtn = btns.find(btn => normalize(btn.textContent || '') === targetVal || normalize(btn.textContent || '').includes(targetVal));
    if (targetBtn) {
      targetBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  }
};

export const GenericAriaComboboxAdapter: FieldAdapter = {
  name: 'GenericAriaCombobox',
  detect: (element: Element) => element.getAttribute('role') === 'combobox',
  read: (element: Element) => {
    const input = element.tagName === 'INPUT' ? element as HTMLInputElement : element.querySelector('input');
    if (input && input.value) return input.value;
    return element.textContent?.trim() || '';
  },
  write: async (element: Element, data: any) => {
    let valStr: string[] = [];
    let optionValues: string[] = [];
    let optionLabels: string[] = [];
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      valStr = data.value ? data.value.split(',') : [];
      optionValues = data.optionValue ? data.optionValue.split(',') : [];
      optionLabels = data.optionLabel ? data.optionLabel.split(',') : [];
    } else {
      const v = Array.isArray(data) ? data : [data];
      valStr = v.filter(Boolean).map(String);
    }
    
    const count = Math.max(valStr.length, optionLabels.length, optionValues.length);
    if (count === 0) return;
    
    const candidates = [optionLabels[0], optionValues[0], valStr[0]].filter(Boolean);
    if (candidates.length === 0) return;
    const primaryVal = candidates[0];

    element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    const listboxId = element.getAttribute('aria-controls') || element.getAttribute('aria-owns');
    let listbox: Element | null = null;
    
    await new Promise<void>((resolve, reject) => {
      const checkListbox = () => {
        if (listboxId) listbox = document.getElementById(listboxId);
        if (!listbox) listbox = document.querySelector('[role="listbox"]');
        if (listbox) {
          const style = window.getComputedStyle(listbox);
          if (style.display !== 'none' && style.visibility !== 'hidden' && listbox.getClientRects().length > 0) {
            resolve();
            return true;
          }
        }
        return false;
      };

      if (checkListbox()) return;

      const observer = new MutationObserver(() => {
        if (checkListbox()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for listbox for combobox`));
      }, 5000);
    });

    if (!listbox) return;
    await new Promise(r => setTimeout(r, 100));

    const options = Array.from((listbox as Element).querySelectorAll('[role="option"]')) as Element[];
    const targetOption = options.find(opt => {
      const text = opt.textContent?.trim() || '';
      return candidates.some(c => text === c || text.includes(c as string));
    });

    if (targetOption) {
      targetOption.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      targetOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      targetOption.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      targetOption.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    } else {
      throw new Error(`Option "${primaryVal}" not found in combobox`);
    }
  }
};

export const adapters: FieldAdapter[] = [QuasarSelectAdapter, QuasarRadioAdapter, QuasarCheckboxAdapter, QuasarBtnToggleAdapter, GenericAriaComboboxAdapter, NativeSelectAdapter];

export const registerAdapter = (adapter: FieldAdapter) => {
  adapters.push(adapter);
};

export const getAdapterForElement = (element: Element): FieldAdapter | null => {
  for (const adapter of adapters) {
    if (adapter.detect(element)) {
      return adapter;
    }
  }
  return defaultInputAdapter;
};

const defaultInputAdapter: FieldAdapter = {
  name: 'DefaultInput',
  detect: () => true,
  read: (element: Element) => {
    const inputEl = element.tagName.match(/INPUT|TEXTAREA/) 
      ? element as HTMLInputElement | HTMLTextAreaElement 
      : element.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement;
      
    if (inputEl && (inputEl.type === 'radio' || inputEl.type === 'checkbox')) {
      if (!inputEl.checked) return '';
    }
    
    return inputEl ? (inputEl.value || '') : '';
  },
  write: async (element: Element, data: any) => {
    const inputEl = element.tagName.match(/INPUT|TEXTAREA/) 
      ? element as HTMLInputElement | HTMLTextAreaElement 
      : element.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement;
      
    if (!inputEl) return;
    
    let valStr = '';
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      valStr = data.value || '';
    } else {
      const v = Array.isArray(data) ? data[0] : data;
      valStr = String(v || '');
    }

    inputEl.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    inputEl.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    try { inputEl.focus(); } catch (e) {}

    if (inputEl.type === 'checkbox' || inputEl.type === 'radio') {
      if (!inputEl.checked) {
        inputEl.checked = true;
      }
    } else {
      const prototype = Object.getPrototypeOf(inputEl);
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
      if (descriptor && descriptor.set) {
        descriptor.set.call(inputEl, valStr);
      } else {
        inputEl.value = valStr;
      }
    }
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    inputEl.dispatchEvent(new Event('blur', { bubbles: true }));
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    inputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    inputEl.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    inputEl.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    try { inputEl.blur(); } catch (e) {}
    
    // Simulate clicking outside for robust blur detection
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }
};
