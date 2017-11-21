"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tinycolor = require("tinycolor2");
/**
 * Convert a color string to its hexadecimal format
 * @param color
 * @returns {any}
 */
function getHexColorString(color) {
    return tinycolor(color).toHexString().toUpperCase();
}
exports.getHexColorString = getHexColorString;
/**
 * Given a hexadecimal color string, return a lightened version of that color.
 * @param color - the color to convert
 * @param percent - the amount, 0 to 1, to lighten
 */
function lightenHexColorString(color, percent) {
    return getHexColorString(tinycolor(color).lighten(percent * 100).toString());
}
exports.lightenHexColorString = lightenHexColorString;
/**
 * Given a hexadecimal color string, return a darkened version of that color.
 * @param color - the color to convert
 * @param percent - the amount, 0 to 1, to darken
 */
function darkenHexColorString(color, percent) {
    return getHexColorString(tinycolor(color).darken(percent * 100).toString());
}
exports.darkenHexColorString = darkenHexColorString;
/**
 * given a color, determine if the color is considered to be light
 * @param color
 * @returns {boolean}
 */
function colorIsLight(color) {
    return tinycolor(color).isLight();
}
exports.colorIsLight = colorIsLight;
/**
 * given a color, determine if the color is considered to be dark
 * @param color
 * @returns {boolean}
 */
function colorIsDark(color) {
    return tinycolor(color).isDark();
}
exports.colorIsDark = colorIsDark;
function colorIsValid(color) {
    return tinycolor(color).isValid();
}
exports.colorIsValid = colorIsValid;
function colorIsValidFullHexString(color) {
    return tinycolor(color).isValid() && color.replace('#', '').length === 6;
}
exports.colorIsValidFullHexString = colorIsValidFullHexString;
function getColorPalette(color) {
    return []
        .concat(tinycolor(color).toHexString())
        .concat(getMonochromaticColors(color))
        .concat(getAnalogousColors(color))
        .concat(getTriadColors(color))
        .concat(getTetradColors(color))
        .concat(getSplitComplementColors(color));
}
exports.getColorPalette = getColorPalette;
function getAnalogousColors(color) {
    return tinycolor(color).analogous().map(function (t) { return t.toHexString(); });
}
exports.getAnalogousColors = getAnalogousColors;
function getMonochromaticColors(color) {
    return tinycolor(color).monochromatic().map(function (t) { return t.toHexString(); });
}
exports.getMonochromaticColors = getMonochromaticColors;
function getSplitComplementColors(color) {
    return tinycolor(color).splitcomplement().map(function (t) { return t.toHexString(); });
}
exports.getSplitComplementColors = getSplitComplementColors;
function getTriadColors(color) {
    return tinycolor(color).triad().map(function (t) { return t.toHexString(); });
}
exports.getTriadColors = getTriadColors;
function getTetradColors(color) {
    return tinycolor(color).tetrad().map(function (t) { return t.toHexString(); });
}
exports.getTetradColors = getTetradColors;
