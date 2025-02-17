export const getByteSize = (value: string) => new Blob([value]).size;

export const toSentenceCase = (text: string) =>
  text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
