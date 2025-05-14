declare module '@capacitor-community/file-opener' {
  export interface FileOpenerOptions {
    filePath: string;
    contentType?: string;
    openWithDefault?: boolean;
    chooserPosition?: { x: number; y: number };
  }

  export interface FileOpenerPlugin {
    open(options: FileOpenerOptions): Promise<void>;
  }

  export const FileOpener: FileOpenerPlugin;
} 