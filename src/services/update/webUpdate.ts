import { ref } from 'vue'
import { Preferences } from '@capacitor/preferences'

// 获取当前版本（从package.json或编译时注入）
const CURRENT_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

export async function checkWebUpdate(): Promise<boolean> {
  try {
    const { value: lastChecked } = await Preferences.get({ key: 'lastUpdateCheck' })
    // 24小时检查一次
    if (lastChecked && Date.now() - Number(lastChecked) < 86400000) {
      return false
    }
    
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/version.json?t=${Date.now()}`)
    const { version, requiresRefresh, assets } = await res.json()
    
    await Preferences.set({ key: 'lastUpdateCheck', value: Date.now().toString() })
    
    if (version !== CURRENT_VERSION || requiresRefresh) {
      return await handleWebUpdate(assets)
    }
    return false
  } catch (error) {
    console.warn('Web更新检查失败:', error)
    return false
  }
}

async function handleWebUpdate(assets: string[]): Promise<boolean> {
  try {
    const cache = await caches.open('app-assets')
    await Promise.all(
      assets.map(async (asset) => {
        const response = await fetch(asset)
        await cache.put(asset, response.clone())
      })
    )
    
    // 使用Service Worker控制更新时机
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) {
        reg.postMessage({ type: 'UPDATE_ASSETS' })
      }
    }
    
    return true
  } catch (error) {
    console.error('Web资源更新失败:', error)
    return false
  }
}
