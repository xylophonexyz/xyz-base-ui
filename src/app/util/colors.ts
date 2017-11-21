import * as tinycolor from 'tinycolor2';

/**
 * Convert a color string to its hexadecimal format
 * @param color
 * @returns {any}
 */
export function getHexColorString(color: string): string {
  return tinycolor(color).toHexString().toUpperCase();
}

/**
 * Given a hexadecimal color string, return a lightened version of that color.
 * @param color - the color to convert
 * @param percent - the amount, 0 to 1, to lighten
 */
export function lightenHexColorString(color: string, percent: number): string {
  return getHexColorString(tinycolor(color).lighten(percent * 100).toString());
}

/**
 * Given a hexadecimal color string, return a darkened version of that color.
 * @param color - the color to convert
 * @param percent - the amount, 0 to 1, to darken
 */
export function darkenHexColorString(color: string, percent: number): string {
  return getHexColorString(tinycolor(color).darken(percent * 100).toString());
}

/**
 * given a color, determine if the color is considered to be light
 * @param color
 * @returns {boolean}
 */
export function colorIsLight(color: string): boolean {
  return tinycolor(color).isLight();
}

/**
 * given a color, determine if the color is considered to be dark
 * @param color
 * @returns {boolean}
 */
export function colorIsDark(color: string): boolean {
  return tinycolor(color).isDark();
}

export function colorIsValid(color: string): boolean {
  return tinycolor(color).isValid();
}

export function colorIsValidFullHexString(color: string): boolean {
  return tinycolor(color).isValid() && color.replace('#', '').length === 6;
}

export function getColorPalette(color: string): string[] {
  return []
    .concat(tinycolor(color).toHexString())
    .concat(getMonochromaticColors(color))
    .concat(getAnalogousColors(color))
    .concat(getTriadColors(color))
    .concat(getTetradColors(color))
    .concat(getSplitComplementColors(color));
}

export function getAnalogousColors(color: string): string[] {
  return tinycolor(color).analogous().map(t => t.toHexString());
}

export function getMonochromaticColors(color: string): string[] {
  return tinycolor(color).monochromatic().map(t => t.toHexString());
}

export function getSplitComplementColors(color: string): string[] {
  return tinycolor(color).splitcomplement().map(t => t.toHexString());
}

export function getTriadColors(color: string): string[] {
  return tinycolor(color).triad().map(t => t.toHexString());
}

export function getTetradColors(color: string): string[] {
  return tinycolor(color).tetrad().map(t => t.toHexString());
}
