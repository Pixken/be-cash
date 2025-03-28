const ionicStorage = inject<Storage>('storage')

const storage = {
  local: {
    has: (key: string) => {
      return Object.prototype.hasOwnProperty.call(ionicStorage, `ohws_${key}`)
    },
    get: (key: string) => {
      return ionicStorage?.getItem(`ohws_${key}`)
    },
    set: (key: string, value: string) => {
      ionicStorage?.setItem(`ohws_${key}`, value)
    },
    remove: (key: string) => {
      ionicStorage?.removeItem(`ohws_${key}`)
    },
    clear: () => {
      ionicStorage?.clear()
    },
  },
  session: {
    has: (key: string) => {
      return Object.prototype.hasOwnProperty.call(sessionStorage, `ohws_${key}`)
    },
    get: (key: string) => {
      return sessionStorage.getItem(`ohws_${key}`)
    },
    set: (key: string, value: string) => {
      sessionStorage.setItem(`ohws_${key}`, value)
    },
    remove: (key: string) => {
      sessionStorage.removeItem(`ohws_${key}`)
    },
    clear: () => {
      sessionStorage.clear()
    },
  },
}

export default storage