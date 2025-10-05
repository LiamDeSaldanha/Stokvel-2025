import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: true,  // allows access from ces-6.cs.uct.ac.za
    port: 3000,
   
    hmr: {
      protocol: 'wss',
      host: 'ces-6.cs.uct.ac.za',
    },
    proxy: {
      '/api': {
        target: 'https://ces-6.cs.uct.ac.za:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});


