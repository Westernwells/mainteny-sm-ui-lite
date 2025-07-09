export const getByteSize = (value: string) => new Blob([value]).size;

export const checkIsEmail = (val: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

export const checkIsWebsite = (val: string) => {
  const trimmed = val.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;

  try {
    const url = new URL(
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`,
    );

    const labels = url.hostname.split('.');
    if (labels.length < 2) return false;

    const tld = labels[labels.length - 1];
    return tld.length >= 2;
  } catch {
    return false;
  }
};

export const toCamelCase = (value: string, separator = '_') => {
  if (!value) return value;

  return value
    .toLowerCase()
    .split(separator)
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
};
