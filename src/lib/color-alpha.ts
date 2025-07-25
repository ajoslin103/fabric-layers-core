/**
 * Modifies the alpha channel of a color string
 * @param color - Color string in rgba format
 * @param value - New alpha value (0-1), defaults to the current alpha or 1
 * @returns Modified rgba color string
 */
export default function alpha(color: string, value?: number): string {
  const obj = color.replace(/[^\d,]/g, '').split(',');
  if (value == null) value = parseFloat(obj[3]) || 1;
  obj[3] = value.toString();
  return 'rgba(' + obj.join(',') + ')';
}
