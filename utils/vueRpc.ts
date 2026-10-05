export const callVueRpc = (action: 'GET_MODEL' | 'SET_MODEL', targetId: string, value?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const messageId = Math.random().toString(36).substring(2, 15);
    
    const handler = (event: MessageEvent) => {
      if (event.source !== window || !event.data || event.data.type !== 'FILLR_VUE_RPC_RES' || event.data.messageId !== messageId) {
        return;
      }
      window.removeEventListener('message', handler);
      
      if (event.data.success) {
        resolve(event.data.data);
      } else {
        reject(new Error(event.data.error || 'RPC Error'));
      }
    };
    
    window.addEventListener('message', handler);
    window.postMessage({ type: 'FILLR_VUE_RPC_REQ', messageId, action, targetId, value }, '*');
    
    // timeout
    setTimeout(() => {
      window.removeEventListener('message', handler);
      reject(new Error('RPC Timeout'));
    }, 15000); // 15s because some checks can take 10s
  });
};
