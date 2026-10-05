export default defineContentScript({
  matches: ['<all_urls>'],
  world: 'MAIN',
  runAt: 'document_idle',
  main() {
    window.addEventListener('message', (event) => {
      if (event.source !== window || !event.data || event.data.type !== 'FILLR_VUE_RPC_REQ') {
        return;
      }
      
      const { messageId, action, targetId, value } = event.data;
      
      try {
        const el = document.getElementById(targetId);
        if (!el) throw new Error('Element not found');
        
        let current: any = el;
        let instance = null;
        while (current) {
          if (current.__vueParentComponent) {
            instance = current.__vueParentComponent;
            let comp = instance;
            while (comp) {
              if (comp.type?.name === 'QSelect' || comp.type?.name === 'QInput') {
                instance = comp;
                break;
              }
              comp = comp.parent;
            }
            break;
          }
          current = current.parentElement;
        }

        if (!instance) {
          throw new Error('Vue instance not found');
        }

        if (action === 'GET_MODEL') {
          const val = instance.props?.modelValue;
          let safeVal = null;
          if (val === null || typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || Array.isArray(val)) {
            safeVal = val;
          } else if (typeof val === 'object') {
            try {
               safeVal = JSON.parse(JSON.stringify(val));
            } catch (e) {
               safeVal = null;
            }
          }
          
          window.postMessage({ type: 'FILLR_VUE_RPC_RES', messageId, success: true, data: safeVal }, '*');
        } else if (action === 'SET_MODEL') {
          if (typeof instance.props?.['onUpdate:modelValue'] === 'function') {
             const doSet = () => {
                instance.props['onUpdate:modelValue'](value);
                window.postMessage({ type: 'FILLR_VUE_RPC_RES', messageId, success: true }, '*');
             };

             if (instance.type?.name === 'QSelect') {
                let elapsed = 0;
                const checkInterval = 100;
                
                const isValueInOptions = (opts: any[], val: any, optValProp: any) => {
                  if (!opts || !Array.isArray(opts)) return false;
                  if (typeof optValProp === 'string') {
                    return opts.some(opt => opt && typeof opt === 'object' ? opt[optValProp] === val : opt === val);
                  }
                  if (typeof optValProp === 'function') {
                    return opts.some(opt => optValProp(opt) === val);
                  }
                  return opts.some(opt => opt && typeof opt === 'object' ? opt.value === val : opt === val);
                };

                const checkOptions = () => {
                  const options = instance.props.options;
                  const optionValue = instance.props['option-value'] || instance.props.optionValue;
                  
                  if (options && options.length > 0 && isValueInOptions(options, value, optionValue)) {
                     doSet();
                     return;
                  }
                  
                  elapsed += checkInterval;
                  if (elapsed >= 10000) {
                     window.postMessage({ type: 'FILLR_VUE_RPC_RES', messageId, success: false, error: 'Timeout waiting for options' }, '*');
                     return;
                  }
                  setTimeout(checkOptions, checkInterval);
                };
                checkOptions();
             } else {
                doSet();
             }
          } else {
             throw new Error('Setter onUpdate:modelValue not found');
          }
        }
      } catch (err: any) {
        window.postMessage({ type: 'FILLR_VUE_RPC_RES', messageId, success: false, error: err.message }, '*');
      }
    });
  },
});
