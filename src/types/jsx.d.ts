import 'vue/jsx'

declare module 'vue/jsx' {
  interface JSX {
    IntrinsicElements: {
      [elem: string]: any
    }
  }
} 