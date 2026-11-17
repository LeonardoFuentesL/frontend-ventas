import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuración básica de Vite para Vue 3 en el puerto 5173 (permitido por CORS en el backend)
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173
  }
})
