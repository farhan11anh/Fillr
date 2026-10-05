import { dlog } from '@/utils/debug';

export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'runtime',
  async main() {
    try {
      const debugData = await chrome.storage.local.get(['fillkit_debug_mode']);
      const debugMode = debugData.fillkit_debug_mode || false;
      
      const url = new URL(window.location.href);
      const key = `fillkit_saved_form_${url.origin}${url.pathname}${url.hash}`;
      const data = await chrome.storage.local.get([key]);
      const savedFields = data[key] || [];

      if (debugMode) {
        console.groupCollapsed(`[Fillkit] Fill Form Session (${savedFields.length} fields to process)`);
        dlog('fillSavedForm', 'info', `Starting fill form. Fields: ${savedFields.length}`);
      }

      if (!savedFields || savedFields.length === 0) {
        console.log('No saved fields found for this URL.');
        if (debugMode) console.groupEnd();
        return;
      }

      const { scoreResolver } = require('@/utils/fieldUtils');

      const getElement = (field: any): { el: HTMLElement | null; ambiguous?: boolean, log?: string } => {
        const rawInputsAll = Array.from(document.querySelectorAll<HTMLElement>('input:not([type="hidden"]), select, textarea, [role="combobox"], .q-select, .q-field, .q-radio, .q-checkbox, .q-btn-toggle'));
        
        const getRoots = (inputs: HTMLElement[]) => Array.from(new Set(inputs.map(el => {
          if (el.closest('.q-radio')) return el.closest('.q-radio') as HTMLElement;
          if (el.closest('.q-checkbox')) return el.closest('.q-checkbox') as HTMLElement;
          if (el.closest('.q-btn-toggle')) return el.closest('.q-btn-toggle') as HTMLElement;
          return el.closest('.q-field') as HTMLElement || el;
        })));

        let rawInputsForm = rawInputsAll;
        if (field.formIndex !== undefined && field.formIndex >= 0) {
          const forms = Array.from(document.querySelectorAll('form'));
          const targetForm = forms[field.formIndex];
          if (targetForm) {
            rawInputsForm = rawInputsAll.filter(el => el.closest('form') === targetForm);
          }
        }
        
        let res = scoreResolver(field, getRoots(rawInputsForm));
        
        // If not found in specific form (maybe form index changed in SPA), fallback to all
        if (!res.el && rawInputsForm.length < rawInputsAll.length) {
          res = scoreResolver(field, getRoots(rawInputsAll));
        }

        if (res.el || res.ambiguous) return res;

        // Legacy fallback
        if (field.id) {
          const el = document.getElementById(field.id);
          if (el) return { el, log: 'Resolved by legacy ID' };
        }
        if (field.index !== undefined) {
          const inputs = document.querySelectorAll('input, textarea, select');
          if (field.index < inputs.length) {
            return { el: inputs[field.index] as HTMLElement, log: 'Resolved by legacy index' };
          }
        }
        
        return res;
      };
      const isElementNotWritable = (el: HTMLElement) => {
        // Quasar wrapper logic: don't check inner input's readonly natively, 
        // rely purely on Quasar's wrapper classes!
        const qField = el.classList.contains('q-field') ? el : el.closest('.q-field');
        if (qField) {
          if (qField.classList.contains('q-field--disabled') || qField.classList.contains('q-field--readonly')) return true;
          return false;
        }

        const input = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? el as HTMLInputElement : el.querySelector('input, textarea') as HTMLInputElement;
        if (input && (input.disabled || input.readOnly)) return true;
        
        if ((el as any).disabled || (el as any).readOnly) return true;
        if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return true;
        if (el.hasAttribute('readonly') || el.getAttribute('aria-readonly') === 'true') return true;
        if (el.classList.contains('disabled')) return true;
        if (el.classList.contains('readonly')) return true;

        return false;
      };

      const waitForElement = (field: any, timeout = 15000): Promise<HTMLElement | null> => {
        return new Promise((resolve, reject) => {
          const check = () => {
            const { el, ambiguous, log } = getElement(field);
            const displayName = field.contextLabel || field.label || field.name || field.placeholder || 'Unknown field';
            
            if (ambiguous) {
               if (debugMode) dlog('fillSavedForm', 'warn', `Resolving "${displayName}": Ambiguous - ${log}`);
               return { done: true, el: null, error: new Error('ambiguous: 2 or more candidates found') };
            }
            if (el && !isElementNotWritable(el)) {
               if (debugMode) dlog('fillSavedForm', 'info', `Resolving "${displayName}": Found - ${log}`);
               return { done: true, el };
            }
            return { done: false, error: null };
          };

          const initial = check();
          if (initial.done) {
             if (initial.error) return reject(initial.error);
             return resolve(initial.el || null);
          }

          const observer = new MutationObserver(() => {
            const res = check();
            if (res.done) {
              observer.disconnect();
              if (res.error) reject(res.error);
              else resolve(res.el || null);
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'readonly', 'style', 'class', 'aria-disabled', 'aria-readonly']
          });

          setTimeout(() => {
            observer.disconnect();
            const res = check();
            if (res.error) reject(res.error);
            else resolve(res.el || null);
          }, timeout);
        });
      };

      const dispatchEvents = (element: HTMLElement) => {
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
      };

      const addHighlight = (element: HTMLElement) => {
        const originalOutline = element.style.outline;
        const originalTransition = element.style.transition;
        
        element.style.transition = 'outline 0.3s ease';
        element.style.outline = '2px solid #4caf50';
        element.style.outlineOffset = '2px';
        
        setTimeout(() => {
          element.style.outline = originalOutline;
          setTimeout(() => {
             element.style.transition = originalTransition;
          }, 300);
        }, 2000);
      };

      const { getAdapterForElement } = require('@/utils/fieldAdapters');
      let filledCount = 0;
      let failedFields: Array<{name: string, reason: string}> = [];

      for (const field of savedFields) {
        let el: HTMLElement | null = null;
        try {
          el = await waitForElement(field);
          if (!el) {
            throw new Error('Element not found on page');
          }
          if (isElementNotWritable(el)) {
            continue;
          }

          const adapter = getAdapterForElement(el);
          if (adapter) {
            const startFill = Date.now();
            field.__debugMode = debugMode; // Pass debugMode to adapter
            await adapter.write(el, field);
            const dur = Date.now() - startFill;
            if (debugMode) dlog('fillSavedForm', 'info', `Field filled successfully`, { name: field.name || field.label, adapter: adapter.name, durationMs: dur, value: field.value });
            addHighlight(el);
            filledCount++;
          }
        } catch (err: any) {
          const cleanLabel = field.contextLabel || field.label || field.name || field.placeholder || field.id || 'Unknown field';
          if (debugMode) dlog('fillSavedForm', 'error', `Failed to fill field ${cleanLabel}`, { error: err.message });
          failedFields.push({
            name: cleanLabel,
            reason: err.message || 'Unknown error'
          });
        }
      }

      // Show toast
      const showToast = (message: string, isError = false) => {
        const host = document.createElement('div');
        const shadow = host.attachShadow({ mode: 'closed' });
        const toast = document.createElement('div');
        
        // Handle newlines in message
        toast.innerHTML = message.replace(/\n/g, '<br/>');
        
        toast.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: ${isError ? '#f44336' : '#333'};
          color: #fff;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: sans-serif;
          font-size: 14px;
          z-index: 999999;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          opacity: 0;
          transition: opacity 0.3s;
          max-width: 300px;
        `;
        shadow.appendChild(toast);
        document.body.appendChild(host);
        
        // fade in
        requestAnimationFrame(() => {
          toast.style.opacity = '1';
        });

        // fade out
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(host);
          }, 300);
        }, 5000); // 5s for better readability of errors
      };

      let msg = `Filled ${filledCount} out of ${savedFields.length} fields.`;
      if (failedFields.length > 0) {
        msg += `\n\nFailed:\n` + failedFields.map(f => `- ${f.name}: ${f.reason}`).join('\n');
      }
      
      if (debugMode) {
        dlog('fillSavedForm', 'info', `Fill complete. Filled: ${filledCount}, Failed: ${failedFields.length}`);
        console.groupEnd();
      }
      
      showToast(msg, failedFields.length > 0);

    } catch (e) {
      console.error('Fill saved form failed:', e);
    }
  },
});
