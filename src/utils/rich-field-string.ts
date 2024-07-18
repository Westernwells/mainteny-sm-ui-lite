export const isPlainString = (value: string) => !/<[^>]+>/.test(value);

// Remove all html tags and return single line string
export const getPlainStringFromHtml = (value: string) =>
  value
    .split('>') // Split on closing tag
    .slice(0, -1) // remove last entry from the closing tag
    .filter((element) => element[0] !== '<' && element !== '') // remove all tag element and
    .map((element) => element.split('<')[0])
    .join('');
