
import { App } from '@capacitor/app';
import packageJson from '../../package.json'

export const isJson = (str: string) => {
  try {
    JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}

export const isObject = (obj: any) => {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}

export const deepClone = (obj: any) => {
  return JSON.parse(JSON.stringify(obj))
}

export const debounce = (fn: Function, delay: number) => {
  let timer: any = null
  return function () {
    const args = arguments
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export const getVersion = async (): Promise<string> => {
  try {
    const { version } = await App.getInfo();
    return version
  } catch (error) {
    console.error('获取应用信息失败:', error);
    // 回退到 package.json 中的版本
    return packageJson.version
  }
}