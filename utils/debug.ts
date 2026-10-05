// src/utils/debug.ts

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: number;
  scope: string;
  level: LogLevel;
  message: string;
  data?: any;
}

const MAX_LOGS = 500;

// Use window to share the buffer across multiple content script injections
interface FillrWindow extends Window {
  __FILLR_DEBUG_LOGS__?: LogEntry[];
}
let logBuffer: LogEntry[] = [];
const win = typeof window !== 'undefined' ? (window as unknown as FillrWindow) : null;
if (win) {
  if (!win.__FILLR_DEBUG_LOGS__) {
    win.__FILLR_DEBUG_LOGS__ = [];
  }
  logBuffer = win.__FILLR_DEBUG_LOGS__;
}

/**
 * Redacts string values to their lengths. 
 * Passwords should be omitted or completely redacted.
 */
export function redactData(data: any): any {
  if (data === null || data === undefined) return data;
  
  if (typeof data === 'string') {
    return `[String length ${data.length}]`;
  }
  
  if (Array.isArray(data)) {
    return data.map(redactData);
  }
  
  if (typeof data === 'object') {
    const redacted: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Redact passwords entirely
        if (key.toLowerCase().includes('password')) {
          redacted[key] = '[REDACTED PASSWORD]';
        } else if (key === 'contextLabel' || key === 'label' || key === 'name' || key === 'id') {
          // Allow certain keys to be visible (e.g. identifiers and labels)
          redacted[key] = data[key];
        } else {
          redacted[key] = redactData(data[key]);
        }
      }
    }
    return redacted;
  }
  
  return data;
}

export function dlog(scope: string, level: LogLevel, message: string, data?: any) {
  const redactedData = data !== undefined ? redactData(data) : undefined;
  
  const entry: LogEntry = {
    timestamp: Date.now(),
    scope,
    level,
    message,
    data: redactedData
  };
  
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.shift(); // Remove oldest entry
  }
  
  const prefix = `[Fillkit][${scope}]`;
  if (level === 'error') {
    console.error(prefix, message, redactedData !== undefined ? redactedData : '');
  } else if (level === 'warn') {
    console.warn(prefix, message, redactedData !== undefined ? redactedData : '');
  } else {
    console.log(prefix, message, redactedData !== undefined ? redactedData : '');
  }
}

export function getLogs(): LogEntry[] {
  return [...logBuffer];
}

export function clearLogs() {
  logBuffer.length = 0;
}

// Add message listener for pulling logs
if (typeof window !== 'undefined' && !(window as any).__FILLR_DEBUG_LISTENER_ADDED__) {
  (window as any).__FILLR_DEBUG_LISTENER_ADDED__ = true;
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'GET_DEBUG_LOGS') {
        sendResponse(getLogs());
      }
    });
  }
}
