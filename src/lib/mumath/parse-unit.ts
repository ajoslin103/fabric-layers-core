/**
 * Parse a value with unit into its numeric and unit parts
 */
export default function parseUnit(str: string | number, out?: [number, string]): [number, string] {
  if (!out) {
    out = [0, ''];
  }

  str = String(str);
  const num = parseFloat(str);
  out[0] = num;
  out[1] = str.match(/[\d.\-\+]*\s*(.*)/)?.[1] || '';
  return out;
}
