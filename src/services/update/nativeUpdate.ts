// 需要先安装依赖
// npm install @capacitor/filesystem @capacitor/app @capacitor/device @capacitor/network @capacitor/dialog
import { Filesystem, Directory } from '@capacitor/filesystem'
import { App } from '@capacitor/app'
import { Device } from '@capacitor/device'
import { Network } from '@capacitor/network'
import { Dialog } from '@capacitor/dialog'
import { get } from '@/utils/request'
import axios from 'axios'
import emitter from '@/utils/emitter'

interface ApkUpdateInfo {
  version: string
  minVersion: string
  url: string
  size: number
  sha256: string
  isCritical: boolean
}

export async function checkNativeUpdate(
  onProgress?: (progress: number) => void
): Promise<boolean> {
  try {

    const { platform } = await Device.getInfo()
    
    // 只在 Android 平台执行更新
    if (platform !== 'android') return false

    // 0. 检查网络状况
    const { connected } = await Network.getStatus()
    if (!connected) return false

    // 1. 获取当前版本信息
    const { version: currentVersion } = await App.getInfo()
    
    // 2. 获取服务器更新信息
    const res = await fetch(`${import.meta.env.VITE_STATIC_URL}/apk-update.json`)
    const { android }: { android: ApkUpdateInfo } = await res.json()

    // emitter.emit("message", { msg: `${android.version}, ${currentVersion}`, type: 'success' })
    
    // 3. 版本比较
    if (compareVersions(android.version, currentVersion) <= 0) {
      return false
    }
    
    // 4. 检查最低支持版本
    if (compareVersions(currentVersion, android.minVersion) < 0) {
      console.warn(`当前版本(${currentVersion})过低，必须升级`)
      emitter.emit('message', { msg: `当前版本(${currentVersion})过低，必须升级`, type: 'error' })
      return await downloadAndInstallApk(android, true, onProgress)
    }
    
    // 5. 弹出更新对话框
    const shouldUpdate = await showUpdateDialog(android)
    if (shouldUpdate) {
      return await downloadAndInstallApk(android, false, onProgress)
    }
    
    return false
  } catch (error) {
    console.error('原生更新检查失败:', error)
    emitter.emit('message', { msg: '原生更新检查失败:'+ error, type: 'error' })
    return false
  }
}

// =============== 工具函数 ===============
async function downloadAndInstallApk(
  info: ApkUpdateInfo,
  isForce: boolean,
  onProgress?: (progress: number) => void
): Promise<boolean> {
  try {
    // 1. 请求存储权限 - 在 Android 上，文件系统操作会自动请求权限
    
    // 2. 下载文件
    const fileName = `${info.version}.apk`
    const filePath = await downloadFile({
      url: info.url,
      fileName,
      expectedSize: info.size,
      onProgress,
    })
    
    // 3. 验证文件完整性
    // const isValid = await verifyFile(filePath, info.sha256)
    // if (!isValid) {
    //   await Filesystem.deleteFile({ path: filePath, directory: Directory.External })
    //   throw new Error('文件校验失败')
    // }
    
    // 4. 安装APK
    await installApk(filePath)
    return true
  } catch (error) {
    console.error('APK更新失败:', error)
    emitter.emit('message', { msg: 'APK更新失败:'+ error, type: 'error' })
    if (isForce) {
      await showCriticalUpdateError()
    }
    return false
  }
}

// 版本比较函数
function compareVersions(versionA: string, versionB: string): number {
  const partsA = versionA.split('.').map(Number)
  const partsB = versionB.split('.').map(Number)
  
  const maxLength = Math.max(partsA.length, partsB.length)
  
  for (let i = 0; i < maxLength; i++) {
    const partA = partsA[i] || 0
    const partB = partsB[i] || 0
    
    if (partA > partB) return 1
    if (partA < partB) return -1
  }
  
  return 0 // 版本相同
}

// 显示更新对话框
async function showUpdateDialog(info: ApkUpdateInfo): Promise<boolean> {
  const { value } = await Dialog.confirm({
    title: '发现新版本',
    message: `发现新版本 ${info.version}，是否立即更新？`,
    okButtonTitle: '立即更新',
    cancelButtonTitle: '稍后再说'
  })
  
  return value
}

// 显示严重错误对话框
async function showCriticalUpdateError() {
  await Dialog.alert({
    title: '更新失败',
    message: '当前版本过低，更新失败。请手动下载最新版本。',
    buttonTitle: '我知道了'
  })
  
  // 可以选择退出应用
  await App.exitApp()
}

// 下载文件
async function downloadFile(options: {
  url: string
  fileName: string
  expectedSize: number
  onProgress?: (progress: number) => void
}): Promise<string> {
  const { url, fileName, expectedSize, onProgress } = options
  
  // 检查文件是否已存在
  try {
    const fileInfo = await Filesystem.stat({
      path: fileName,
      directory: Directory.External
    })
    
    // 如果文件已存在且大小正确，直接返回
    if (fileInfo.size === expectedSize) {
      return fileInfo.uri
    }
  } catch (e) {
    // 文件不存在，继续下载
  }
  
  try {
    // 下载文件
    const response = await fetch(url)
    if (!response.ok) throw new Error('下载失败 ')
    
    // 获取总大小
    const contentLength = Number(response.headers.get('Content-Length') || expectedSize)
    
    // 创建响应的 Blob 对象
    const blob = await response.blob()
    
    if (onProgress) {
      // 下载完成后更新进度为 99%
      onProgress(99)
    }
    
    // 使用 FileReader 读取 Blob 数据
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        // 结果是 DataURL 格式，需要移除前缀 "data:application/octet-stream;base64,"
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
    
    // 保存文件
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.External
    })
    console.log('downloadFile', result);
    
    if (onProgress) onProgress(100)
    
    return result.uri
  } catch (error) {
    console.error('文件下载失败:', error)
    emitter.emit('message', { msg: '文件下载失败:' + error, type: 'error' })
    throw error
  }
}

// 验证文件
async function verifyFile(filePath: string, expectedHash: string): Promise<boolean> {
  try {
    // 读取文件
    const fileData = await Filesystem.readFile({
      path: filePath,
      directory: Directory.External
    })
    console.log(fileData)
    // 计算 SHA-256 哈希
    // 注意：Web 环境中可以使用 SubtleCrypto API
    const msgBuffer = new TextEncoder().encode(fileData.data as string)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return hashHex === expectedHash
  } catch (error) {
    console.error('文件校验失败:', error)
    emitter.emit('message', { msg: '文件校验失败:'+ error, type: 'error' })
    return false
  }
}

// 安装APK
async function installApk(filePath: string) {
  // 使用 Browser 插件打开文件 URL
  console.log('installApk', filePath);
  
  // const { Browser } = await import('@capacitor/browser')
  // await Browser.open({ url: filePath })
}