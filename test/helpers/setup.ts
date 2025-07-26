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

// Mock getContext for Canvas
window.HTMLCanvasElement.prototype.getContext = function(): CanvasRenderingContext2D {
  return {
    fillRect: function(): void {},
    clearRect: function(): void {},
    getImageData: function(x: number, y: number, w: number, h: number): ImageData {
      return {
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
        colorSpace: "srgb"
      };
    },
    putImageData: function(): void {},
    createImageData: function(): ImageData[] { return []; },
    setTransform: function(): void {},
    drawImage: function(): void {},
    save: function(): void {},
    fillText: function(): void {},
    restore: function(): void {},
    beginPath: function(): void {},
    moveTo: function(): void {},
    lineTo: function(): void {},
    closePath: function(): void {},
    stroke: function(): void {},
    translate: function(): void {},
    scale: function(): void {},
    rotate: function(): void {},
    arc: function(): void {},
    fill: function(): void {},
    measureText: function(): TextMetrics {
      return { width: 0 } as TextMetrics;
    },
    transform: function(): void {},
    rect: function(): void {},
    clip: function(): void {},
  } as unknown as CanvasRenderingContext2D;
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
