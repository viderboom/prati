// rtlCache.js
import createCache from '@emotion/cache'; // Use default import
import rtlPlugin from 'stylis-plugin-rtl'; // Import the rtl plugin

const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [rtlPlugin], // Apply RTL plugin
});

export default rtlCache;
