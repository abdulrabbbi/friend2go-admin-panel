// Debug utility for production debugging
export const debug = {
  log: (...args) => {
    console.log('[DEBUG]', new Date().toISOString(), ...args);
  },
  error: (...args) => {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  },
  warn: (...args) => {
    console.warn('[WARN]', new Date().toISOString(), ...args);
  },
  info: (...args) => {
    console.info('[INFO]', new Date().toISOString(), ...args);
  }
};

// Log environment info
debug.info('Environment:', {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL
});