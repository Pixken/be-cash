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
    // 1. 生成一个唯一的文件名避免缓存问题
    const timestamp = new Date().getTime();
    const fileName = `update_${info.version}_${timestamp}.apk`;
    console.log(`开始下载更新，版本: ${info.version}, 文件名: ${fileName}`);
    
    // 2. 下载文件
    const filePath = await downloadFile({
      url: info.url,
      fileName,
      expectedSize: info.size,
      onProgress,
    });
    
    console.log('APK下载完成，文件路径:', filePath);
    
    // 3. 验证文件完整性
    // 暂时跳过SHA256验证
    
    // 4. 安装APK
    await installApk(filePath);
    return true;
  } catch (error) {
    console.error('APK更新失败:', error);
    emitter.emit('message', { msg: 'APK更新失败: ' + error, type: 'error' });
    if (isForce) {
      await showCriticalUpdateError();
    }
    return false;
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
  
  try {
    // 检查文件是否已存在
    let existingFile = null;
    try {
      const fileInfo = await Filesystem.stat({
        path: fileName,
        directory: Directory.External
      })
      
      existingFile = fileInfo;
      console.log('找到已存在的文件:', fileInfo);
      
      // 如果文件已存在且大小正确，直接返回
      if (fileInfo.size === expectedSize) {
        console.log('文件已存在且大小正确，直接使用:', fileInfo.uri);
        // 已有文件，进度直接设为100%
        if (onProgress) onProgress(100);
        return fileInfo.uri
      } else {
        console.log('文件存在但大小不正确，将重新下载');
      }
    } catch (e) {
      // 文件不存在，继续下载
      console.log('文件不存在，开始下载');
    }
    
    // 下载文件
    console.log(`开始从 ${url} 下载文件 ${fileName}`);
    
    // 使用fetch API但以流的方式处理以获取下载进度
    const response = await fetch(url);
    if (!response.ok) throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    
    // 获取总大小
    const contentLength = Number(response.headers.get('Content-Length') || expectedSize);
    console.log(`文件大小: ${contentLength} 字节`);
    
    // 使用ReadableStream处理下载进度
    if (response.body) {
      if (onProgress) onProgress(0); // 初始进度为0%
      
      // 创建 ReadableStreamReader
      const reader = response.body.getReader();
      
      // 用于累积接收到的数据
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      
      // 循环读取数据块，直到下载完成
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('数据流已接收完成');
          break;
        }
        
        // 累加数据块
        chunks.push(value);
        receivedLength += value.length;
        
        // 更新进度
        if (onProgress && contentLength) {
          const progress = Math.round((receivedLength / contentLength) * 97); // 留出3%用于后续处理
          onProgress(progress);
          console.log(`下载进度: ${progress}%`);
        }
      }
      
      // 合并数据块为一个Uint8Array
      const chunksAll = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }
      
      // 创建Blob对象
      const blob = new Blob([chunksAll]);
      console.log(`Blob 已创建，大小: ${blob.size} 字节`);
      
      if (onProgress) onProgress(98); // 设置为98%，表示下载完成，正在处理
      
      // 使用 FileReader 读取 Blob 数据
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // 结果是 DataURL 格式，需要移除前缀 "data:application/octet-stream;base64,"
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          console.log(`已将文件转换为 Base64 格式`);
          resolve(base64);
        };
        reader.onerror = () => {
          console.error('FileReader 错误:', reader.error);
          reject(reader.error);
        };
        reader.readAsDataURL(blob);
      });
      
      if (onProgress) onProgress(99); // 设置为99%，表示即将写入文件系统
      
      // 如果文件已存在但大小不对，先删除
      if (existingFile && existingFile.size !== expectedSize) {
        try {
          await Filesystem.deleteFile({
            path: fileName,
            directory: Directory.External
          });
          console.log('已删除大小不正确的现有文件');
        } catch (deleteError) {
          console.warn('删除现有文件失败:', deleteError);
        }
      }
      
      // 保存文件
      console.log(`开始将文件保存到: ${fileName}`);
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.External
      });
      console.log('文件下载完成并保存，URI:', result.uri);
      
      if (onProgress) onProgress(100); // 设置为100%，下载完成
      
      try {
        // 验证文件是否成功写入
        const fileInfo = await Filesystem.stat({
          path: fileName,
          directory: Directory.External
        });
        console.log('已下载文件信息:', fileInfo);
        
        // 返回文件的URI
        return fileInfo.uri;
      } catch (statError) {
        console.warn('无法验证已下载文件状态:', statError);
        // 虽然无法验证，但仍返回写入操作返回的URI
        return result.uri;
      }
    } else {
      // 如果不支持ReadableStream，退回到原来的方法
      const blob = await response.blob();
      console.log(`Blob 已创建，大小: ${blob.size} 字节`);
      
      if (onProgress) onProgress(80); // 假设已完成80%
      
      // 使用 FileReader 读取 Blob 数据
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          console.log(`已将文件转换为 Base64 格式`);
          resolve(base64);
        };
        reader.onerror = () => {
          console.error('FileReader 错误:', reader.error);
          reject(reader.error);
        };
        reader.readAsDataURL(blob);
      });
      
      if (onProgress) onProgress(90); // 设置为90%
      
      // 如果文件已存在但大小不对，先删除
      if (existingFile && existingFile.size !== expectedSize) {
        try {
          await Filesystem.deleteFile({
            path: fileName,
            directory: Directory.External
          });
        } catch (deleteError) {
          console.warn('删除现有文件失败:', deleteError);
        }
      }
      
      // 保存文件
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.External
      });
      
      if (onProgress) onProgress(100); // 设置为100%
      
      try {
        const fileInfo = await Filesystem.stat({
          path: fileName,
          directory: Directory.External
        });
        return fileInfo.uri;
      } catch (statError) {
        return result.uri;
      }
    }
  } catch (error) {
    console.error('文件下载失败:', error);
    emitter.emit('message', { msg: '文件下载失败: ' + error, type: 'error' });
    throw error;
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
  console.log('开始安装APK，路径:', filePath);
  
  try {
    // 转换文件路径格式
    // Android上，FileOpener需要完整的file://路径
    if (!filePath.startsWith('file://')) {
      // 如果不是完整路径，尝试获取完整路径
      try {
        const fileInfo = await Filesystem.stat({
          path: filePath,
          directory: Directory.External
        });
        console.log('获取到文件信息:', fileInfo);
        
        // 使用文件的完整uri
        if (fileInfo && fileInfo.uri) {
          filePath = fileInfo.uri;
          console.log('使用文件的完整URI:', filePath);
        }
      } catch (error) {
        console.warn('获取文件信息失败, 尝试继续使用原始路径:', error);
      }
    }
    
    // 导入插件
    const { FileOpener } = await import('@capacitor-community/file-opener');
    
    // 打开APK文件进行安装
    console.log('调用FileOpener打开文件:', filePath);
    await FileOpener.open({
      filePath: filePath,
      contentType: 'application/vnd.android.package-archive',
      openWithDefault: true
    });
    
    console.log('APK安装程序已启动');
  } catch (error) {
    console.error('安装APK失败:', error);
    emitter.emit('message', { msg: '安装APK失败: ' + error, type: 'error' });
    throw error;
  }
}