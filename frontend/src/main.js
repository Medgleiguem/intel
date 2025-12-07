import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import './style.css'

// Import routes
import routes from './router/routes'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create Pinia store
const pinia = createPinia()

// Create Vue app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)

// Register service worker
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('New version available. Reload to update?')) {
        updateSW(true)
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline')
    }
  })
}

// Mount app
app.mount('#app')

// Handle offline/online events
window.addEventListener('online', () => {
  console.log('Connection restored')
  // Sync any offline data
})

window.addEventListener('offline', () => {
  console.log('Connection lost - switching to offline mode')
})