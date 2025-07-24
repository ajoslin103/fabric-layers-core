declare module '../lib/panzoom' {
  function panzoom(element: HTMLElement, options?: PanzoomOptions): PanzoomInstance;
  
  interface PanzoomOptions {
    maxScale?: number;
    minScale?: number;
    increment?: number;
    rangeStep?: number;
    step?: number;
    panOnlyWhenZoomed?: boolean;
    disableZoom?: boolean;
    disablePan?: boolean;
    contain?: boolean;
    cursor?: string;
    [key: string]: any;
  }
  
  interface PanzoomInstance {
    zoom(scale: number, options?: any): void;
    pan(x: number, y: number, options?: any): void;
    reset(options?: any): void;
    getScale(): number;
    getPan(): { x: number; y: number };
    setOptions(options: PanzoomOptions): void;
    destroy(): void;
  }
  
  export default panzoom;
}
