// sRGB -> linear -> OKLab conversion (matches oklabToLinear in sdfCollision.glsl.ts)
export function srgbToOklab(
  c: [number, number, number]
): [number, number, number] {
  // sRGB to linear
  const lr = Math.pow(c[0], 2.2);
  const lg = Math.pow(c[1], 2.2);
  const lb = Math.pow(c[2], 2.2);
  // linear to OKLab
  let l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  let m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  let s = 0.0883024619 * lr + 0.2220049168 * lg + 0.6896926213 * lb;
  l = Math.cbrt(l);
  m = Math.cbrt(m);
  s = Math.cbrt(s);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
}
