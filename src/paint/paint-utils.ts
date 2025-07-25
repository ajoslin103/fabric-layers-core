import { fabric } from 'fabric';

/**
 * Creates a new fabric canvas
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param options - Additional fabric canvas options
 * @returns A new fabric.Canvas instance
 */
export function createCanvas(
  width: number,
  height: number,
  options: fabric.ICanvasOptions = {}
): fabric.Canvas {
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Create fabric canvas
  const fabricCanvas = new fabric.Canvas(canvas, {
    width,
    height,
    ...options
  });

  return fabricCanvas;
}

/**
 * Clears all objects from the canvas
 * @param canvas - The fabric canvas to clear
 */
export function clearCanvas(canvas: fabric.Canvas): void {
  canvas.clear();
}

/**
 * Resizes a fabric canvas
 * @param canvas - The fabric canvas to resize
 * @param width - New width in pixels
 * @param height - New height in pixels
 * @param scaleContent - Whether to scale content with canvas
 */
export function resizeCanvas(
  canvas: fabric.Canvas,
  width: number,
  height: number,
  scaleContent: boolean = false
): void {
  if (scaleContent) {
    // Get scale factors
    const scaleX = width / canvas.getWidth();
    const scaleY = height / canvas.getHeight();

    // Scale all objects
    const objects = canvas.getObjects();
    for (const obj of objects) {
      obj.scaleX = obj.scaleX ? obj.scaleX * scaleX : scaleX;
      obj.scaleY = obj.scaleY ? obj.scaleY * scaleY : scaleY;
      obj.left = obj.left ? obj.left * scaleX : 0;
      obj.top = obj.top ? obj.top * scaleY : 0;
      obj.setCoords();
    }
  }

  // Set canvas dimensions
  canvas.setWidth(width);
  canvas.setHeight(height);
  canvas.renderAll();
}

/**
 * Exports the canvas as a data URL
 * @param canvas - The fabric canvas to export
 * @param format - Image format (png, jpeg, webp)
 * @param quality - Image quality for jpeg and webp (0-1)
 * @returns Data URL of the canvas
 */
export function canvasToDataURL(
  canvas: fabric.Canvas,
  format: string = 'png',
  quality: number = 0.8
): string {
  return canvas.toDataURL({
    format,
    quality
  });
}

/**
 * Creates a fabric image from a URL
 * @param url - The image URL
 * @param callback - Callback function with the created image
 */
export function createImageFromURL(
  url: string,
  callback: (image: fabric.Image) => void
): void {
  fabric.Image.fromURL(url, callback);
}

/**
 * Applies a filter to a fabric object
 * @param object - The fabric object to apply the filter to
 * @param filter - The filter to apply
 */
export function applyFilter(
  object: fabric.Image,
  filter: fabric.IBaseFilter
): void {
  if (object.filters) {
    object.filters.push(filter);
    object.applyFilters();
  }
}
