import convert, {RGB} from 'color-convert';

export const convertRGBtoHex = (color: string) => {
  const isValidColor = CSS.supports('color', color);

  if (!isValidColor) return;

  const stripRGB = color.split('rgb(');
  const rgbValue = (
    stripRGB.length > 1 ? stripRGB[1].split(',') : color.split(',')
  ).map((value) => value.trim());

  const isValidRGBColor = rgbValue.length === 3;

  if (!isValidRGBColor) return;

  return convert.rgb.hex(rgbValue as unknown as RGB);
};
