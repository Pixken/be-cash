declare module 'markdown-it' {
  interface MarkdownItOptions {
    html?: boolean;
    xhtmlOut?: boolean;
    breaks?: boolean;
    langPrefix?: string;
    linkify?: boolean;
    typographer?: boolean;
    quotes?: string;
    highlight?: (str: string, lang: string) => string;
  }

  interface MarkdownIt {
    render(md: string): string;
  }

  function markdownit(options?: MarkdownItOptions): MarkdownIt;
  export default markdownit;
} 