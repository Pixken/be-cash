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
