declare module 'ant-design-x-vue' {
  import { DefineComponent } from 'vue';
  
  export const Bubble: DefineComponent<any, any, any>;
  export const BubbleList: DefineComponent<any, any, any>;
  export const Prompts: DefineComponent<any, any, any>;
  export const Sender: DefineComponent<any, any, any>;
  
  export interface BubbleProps {
    role: string;
    content: any;
    [key: string]: any;
  }
} 