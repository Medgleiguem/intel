import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const language = ref(localStorage.getItem('language') || 'fr')
  const isOnline = ref(navigator.onLine)
  const cacheEnabled = ref(true)
  const userPreferences = ref(JSON.parse(localStorage.getItem('userPreferences') || '{}'))
  const offlineQueue = ref(JSON.parse(localStorage.getItem('offlineQueue') || '[]'))
  
  // Getters
  const currentLanguage = computed(() => language.value)
  const isRTL = computed(() => language.value === 'ar')
  
  // Actions
  const setLanguage = (lang) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }
  
  const setOnlineStatus = (status) => {
    isOnline.value = status
  }
  
  const addToOfflineQueue = (action) => {
    offlineQueue.value.push({
      ...action,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue.value))
  }
  
  const clearOfflineQueue = () => {
    offlineQueue.value = []
    localStorage.removeItem('offlineQueue')
  }
  
  const updatePreferences = (prefs) => {
    userPreferences.value = { ...userPreferences.value, ...prefs }
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences.value))
  }
  
  const syncOfflineData = async () => {
    if (!isOnline.value || offlineQueue.value.length === 0) return
    
    const queue = [...offlineQueue.value]
    
    for (const action of queue) {
      try {
        // Process each offline action
        await processOfflineAction(action)
      } catch (error) {
        console.error('Failed to sync offline action:', error)
      }
    }
    
    clearOfflineQueue()
  }
  
  const processOfflineAction = async (action) => {
    // Implementation depends on action type
    switch (action.type) {
      case 'SEARCH':
        // Process search query
        break
      case 'BOOKMARK':
        // Process bookmark
        break
      case 'FEEDBACK':
        // Process feedback
        break
      default:
        console.warn('Unknown offline action type:', action.type)
    }
  }
  
  return {
    // State
    language,
    isOnline,
    cacheEnabled,
    userPreferences,
    offlineQueue,
    
    // Getters
    currentLanguage,
    isRTL,
    
    // Actions
    setLanguage,
    setOnlineStatus,
    addToOfflineQueue,
    clearOfflineQueue,
    updatePreferences,
    syncOfflineData
  }
})