// Global type declarations for test environment
declare namespace NodeJS {
  interface Global {
    window: Window & typeof globalThis;
    document: Document;
    navigator: Navigator;
    HTMLElement: typeof HTMLElement;
    HTMLCanvasElement: typeof HTMLCanvasElement;
    HTMLImageElement: typeof HTMLImageElement;
    Image: typeof Image;
    requestAnimationFrame: (callback: FrameRequestCallback) => number;
    cancelAnimationFrame: (id: number) => void;
  }
}
