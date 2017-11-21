import {
  colorIsDark,
  colorIsLight,
  colorIsValid,
  darkenHexColorString,
  getAnalogousColors,
  getColorPalette,
  getHexColorString,
  getMonochromaticColors,
  getSplitComplementColors,
  getTetradColors,
  getTriadColors,
  lightenHexColorString
} from './colors';

describe('Color utilities', () => {
  describe('getHexColorString', () => {
    it('should convert a 6-digit color string to a valid hex string', () => {
      const color = 'FFAAFF';
      expect(getHexColorString(color)).toEqual('#' + color);
    });

    it('should convert a 6-digit mixed-case color string to a valid hex string', () => {
      const color = 'FFaaFf';
      expect(getHexColorString(color)).toEqual('#FFAAFF');
    });

    it('should return the same uppercase valid hex string', () => {
      const color = '#FFAAFF';
      expect(getHexColorString(color)).toEqual(color);
    });

    it('should return the uppercase version of a mix-cased valid hex string', () => {
      const color = '#FFaaFf';
      expect(getHexColorString(color)).toEqual('#FFAAFF');
    });

    it('should return black for improperly formatted argument', () => {
      let color = 'FF@@FF';
      expect(getHexColorString(color)).toEqual('#000000');
      color = 'FFGGFF';
      expect(getHexColorString(color)).toEqual('#000000');
      color = 'FFG';
      expect(getHexColorString(color)).toEqual('#000000');
    });
  });

  describe('lightenHexColorString', () => {
    it('should lighten a color by a specified amount', () => {
      let color = '#000000';
      expect(lightenHexColorString(color, 0.5)).toEqual('#808080');
      color = '#32aaff';
      expect(lightenHexColorString(color, 0.15)).toEqual('#7ECAFF');
    });

    it('should ignore invalid input', () => {
      const color = '$@#$RFA';
      expect(lightenHexColorString(color, 0.5)).toEqual('#808080');
    });
  });

  describe('darkenHexColorString', () => {
    it('should darken a color by a specified amount', () => {
      let color = '#FFFFFF';
      expect(darkenHexColorString(color, 0.5)).toEqual('#808080');
      color = '#3cb878';
      expect(darkenHexColorString(color, 0.15)).toEqual('#297E52');
    });

    it('should ignore invalid input', () => {
      const color = '$@#$RFA';
      expect(darkenHexColorString(color, 0.5)).toEqual('#000000');
    });
  });

  describe('lightness', () => {
    it('should tell if a color is light', () => {
      const color = '#FFaaFF';
      expect(colorIsLight(color)).toEqual(true);
      expect(colorIsDark(color)).toEqual(false);
    });

    it('should tell if a color is dark', () => {
      const color = '#00aa00';
      expect(colorIsDark(color)).toEqual(true);
      expect(colorIsLight(color)).toEqual(false);
    });
  });

  describe('validity', () => {
    it('should tell if a color is valid', () => {
      let color = '#$WWERDF';
      expect(colorIsValid(color)).toEqual(false);
      color = '#FF4444';
      expect(colorIsValid(color)).toEqual(true);
    });
  });

  describe('color palette', () => {
    it('should return a color palette for a given color', () => {
      const color = '#ff223c';
      const palette = getColorPalette(color);
      expect(palette.length).toBeGreaterThan(0);
    });

    it('should return analogous colors', () => {
      const color = '#ff223c';
      const palette = getAnalogousColors(color);
      expect(palette.length).toBeGreaterThan(0);
    });

    it('should return monochromatic colors', () => {
      const color = '#ff223c';
      const palette = getMonochromaticColors(color);
      expect(palette.length).toBeGreaterThan(0);
    });

    it('should return split complement colors', () => {
      const color = '#ff223c';
      const palette = getSplitComplementColors(color);
      expect(palette.length).toBeGreaterThan(0);
    });

    it('should return triad colors', () => {
      const color = '#ff223c';
      const palette = getTriadColors(color);
      expect(palette.length).toBeGreaterThan(0);
    });

    it('should return tetrad colors', () => {
      const color = '#ff223c';
      const palette = getTetradColors(color);
      expect(palette.length).toBeGreaterThan(0);
    });
  });
});
