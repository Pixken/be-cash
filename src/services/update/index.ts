import { Capacitor } from '@capacitor/core'
import { checkWebUpdate } from './webUpdate'
import { checkNativeUpdate } from './nativeUpdate'

export async function checkHybridUpdate() {
  try {
    // 先检查原生更新
    if (Capacitor.isNativePlatform()) {
      const nativeUpdated = await checkNativeUpdate()
      if (nativeUpdated) return true
    }
    
    // 原生无更新或非原生环境，检查Web更新
    return await checkWebUpdate()
  } catch (error) {
    console.error('混合更新检查失败:', error)
    return false
  }
}

// 带进度回调的高级版本
export async function smartUpdate(onProgress?: (progress: number) => void) {
  if (Capacitor.isNativePlatform()) {
    return await checkNativeUpdate(onProgress)
  }
  return await checkWebUpdate()
}
