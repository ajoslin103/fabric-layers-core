import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><head></head><body><div id="test-container"></div></body></html>', {
  url: 'http://localhost'
});

(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).navigator = {
  userAgent: 'node.js'
};

// Mock requestAnimationFrame
window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(callback, 0);
};

window.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
};

// Mock getContext for Canvas with a more complete mock for Fabric.js
window.HTMLCanvasElement.prototype.getContext = function(contextId: string, options?: any): any {
  // Only handle 2d context for now, return null for other types
  if (contextId !== '2d') {
    return null;
  }
  
  const context = {
    // Canvas state methods
    save: function(): void {},
    restore: function(): void {},
    
    // Transformation methods
    scale: function(): void {},
    rotate: function(): void {},
    translate: function(): void {},
    transform: function(): void {},
    setTransform: function(): void {},
    resetTransform: function(): void {},
    
    // Drawing rectangles
    clearRect: function(): void {},
    fillRect: function(): void {},
    strokeRect: function(): void {},
    
    // Drawing paths
    beginPath: function(): void {},
    closePath: function(): void {},
    moveTo: function(): void {},
    lineTo: function(): void {},
    bezierCurveTo: function(): void {},
    quadraticCurveTo: function(): void {},
    arc: function(): void {},
    arcTo: function(): void {},
    ellipse: function(): void {},
    rect: function(): void {},
    
    // Drawing paths (operations)
    fill: function(): void {},
    stroke: function(): void {},
    clip: function(): void {},
    isPointInPath: function(): boolean { return false; },
    isPointInStroke: function(): boolean { return false; },
    
    // Text
    fillText: function(): void {},
    strokeText: function(): void {},
    measureText: function(): TextMetrics {
      return { width: 0, actualBoundingBoxLeft: 0, actualBoundingBoxRight: 0,
              actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0,
              fontBoundingBoxAscent: 0, fontBoundingBoxDescent: 0,
              emHeightAscent: 0, emHeightDescent: 0, hangingBaseline: 0,
              alphabeticBaseline: 0, ideographicBaseline: 0 };
    },
    
    // Image drawing
    drawImage: function(): void {},
    
    // Pixel manipulation
    createImageData: function(width: number, height: number): ImageData {
      return {
        data: new Uint8ClampedArray(width * height * 4),
        width: width,
        height: height,
        colorSpace: 'srgb'
      };
    },
    getImageData: function(x: number, y: number, w: number, h: number): ImageData {
      return {
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
        colorSpace: 'srgb'
      };
    },
    putImageData: function(): void {},
    
    // Properties that Fabric.js uses
    canvas: { width: 300, height: 150 },
    globalAlpha: 1.0,
    globalCompositeOperation: 'source-over',
    filter: 'none',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low',
    strokeStyle: '#000000',
    fillStyle: '#000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: 'rgba(0,0,0,0)',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    lineDashOffset: 0,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    direction: 'ltr',
    fontKerning: 'auto'
  };
  
  // Return our enhanced mock context
  return context;
};

// Mock toDataURL
window.HTMLCanvasElement.prototype.toDataURL = (): string => '';

export function createTestContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
  return container;
}

export function cleanupTestContainer(container: HTMLDivElement): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}
