export const fuzzyMatch = (text: string, pattern: string): boolean => {
  if (!pattern) return true;

  const textLower = text.toLowerCase();
  const patternLower = pattern.toLowerCase();

  return textLower.includes(patternLower);
};
