import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Plugin to handle Tauri API imports
const tauriPlugin = {
  name: 'tauri-api-plugin',
  resolveId(id: string) {
    if (id.startsWith('@tauri-apps/')) {
      return '\0' + id;
    }
  },
  load(id: string) {
    if (id.startsWith('\0@tauri-apps/')) {
      // Return empty module for Tauri APIs
      // They'll be loaded dynamically at runtime only in Tauri
      return 'export default {};';
    }
  }
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tauriPlugin,
      // Only use single file plugin when building for single HTML
      mode === 'singlefile' ? viteSingleFile() : null,
    ].filter(Boolean),
  }
})
