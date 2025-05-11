import { ref, onMounted } from 'vue'
import { checkHybridUpdate, smartUpdate } from '@/services/update'

export function useUpdate() {
  const updateAvailable = ref(false)
  const isUpdating = ref(false)
  const progress = ref(0)
  
  const checkUpdate = async () => {
    updateAvailable.value = await checkHybridUpdate()
    return updateAvailable.value
  }
  
  const performUpdate = async () => {
    if (!updateAvailable.value) return
    
    isUpdating.value = true
    try {
      await smartUpdate((p) => {
        progress.value = p
      })
      updateAvailable.value = false
    } finally {
      isUpdating.value = false
    }
  }
  
  // 自动周期检查
  onMounted(() => {
    const timer = setInterval(checkUpdate, 3600000) // 每小时检查一次
    checkUpdate()
    
    return () => clearInterval(timer)
  })
  
  return {
    updateAvailable,
    isUpdating,
    progress,
    checkUpdate,
    performUpdate,
  }
}
