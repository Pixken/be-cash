import { isJson, isObject } from './common'

export const storage = {
  setItem: (key: string, value: any) => {
    localStorage.setItem(`be-${key}`, isObject(value) ? JSON.stringify(value) : value)
  },
  getItem: (key: string) => {
    return isJson(localStorage.getItem(`be-${key}`) || '{}') ? JSON.parse(localStorage.getItem(`be-${key}`) || '{}') : localStorage.getItem(`be-${key}`)
  },
  removeItem: (key: string) => {
    localStorage.removeItem(`be-${key}`)
  },
  clear: () => {
    localStorage.clear()
  }
}
