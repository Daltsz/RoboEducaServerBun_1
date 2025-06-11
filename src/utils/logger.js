const getTimestamp = () => new Date().toISOString();

export function logInfo(message) {
    console.log(`\x1b[36m[INFO]\x1b[0m ${getTimestamp()} - ${message}`);
  }
  
  export function logWarn(message) {
    console.warn(`\x1b[33m[WARN]\x1b[0m ${getTimestamp()} - ${message}`);
  }
  
  export function logError(message) {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${getTimestamp()} - ${message}`);
  }