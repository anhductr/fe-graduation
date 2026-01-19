import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.CONTENT_CHATBOT_API_URL': JSON.stringify(env.CONTENT_CHATBOT_API_URL),
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
        [`${env.CONTENT_API_URL}/content`]: {
          target: env.VITE_API_ENDPOINT || "",
          changeOrigin: true,
        },
      },
    },
  }
})

