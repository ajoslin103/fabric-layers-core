/**
 * Mouse Event Offset - Get offset coordinates from mouse events
 */

// Default position for root elements
const rootPosition = { left: 0, top: 0 };

/**
 * Calculate the offset of a mouse event relative to a target element
 * @param ev - Mouse event object
 * @param target - Target element (defaults to event's currentTarget)
 * @param out - Optional output array to store coordinates [x, y]
 * @returns Array containing [x, y] coordinates
 */
export default function mouseEventOffset(
  ev: MouseEvent, 
  target?: Element | null,
  out?: number[]
): number[] {
  target = target || ev.currentTarget as Element || ev.srcElement as Element;
  
  if (!Array.isArray(out)) {
    out = [0, 0];
  }
  
  const cx = ev.clientX || 0;
  const cy = ev.clientY || 0;
  const rect = getBoundingClientOffset(target);
  
  out[0] = cx - rect.left;
  out[1] = cy - rect.top;
  
  return out;
}

/**
 * Get the bounding client rect or return root position for special elements
 * @param element - DOM element to get offset for
 * @returns Object with left and top properties
 */
function getBoundingClientOffset(element: Element | Window | Document): { left: number; top: number } {
  if (element === window ||
      element === document ||
      element === document.body) {
    return rootPosition;
  } else {
    return (element as Element).getBoundingClientRect();
  }
}
