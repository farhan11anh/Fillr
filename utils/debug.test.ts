import { dlog, getLogs, clearLogs, redactData } from './debug';

function testDebug() {
  clearLogs();
  
  dlog('test', 'info', 'Test message 1', { name: 'field1', value: 'secret123', password: 'my-password' });
  
  const logs = getLogs();
  if (logs.length !== 1) throw new Error('Expected 1 log');
  
  const data = logs[0].data;
  if (data.name !== 'field1') throw new Error('name should not be redacted');
  if (data.value !== '[String length 9]') throw new Error('value should be redacted by length');
  if (data.password !== '[REDACTED PASSWORD]') throw new Error('password should be completely redacted');
  
  for (let i = 0; i < 600; i++) {
    dlog('test', 'info', `Msg ${i}`);
  }
  
  const finalLogs = getLogs();
  if (finalLogs.length !== 500) throw new Error(`Expected 500 logs, got ${finalLogs.length}`);
  if (finalLogs[0].message !== 'Msg 101') throw new Error(`Expected oldest message to be Msg 101, got ${finalLogs[0].message}`);
  
  console.log('Debug logger tests passed!');
}

testDebug();
