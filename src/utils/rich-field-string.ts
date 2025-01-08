import {EmailSignature} from 'models/employee';

export const isPlainString = (value: string) => !/<[^>]+>/.test(value);

// Remove all html tags and return single line string
export const getPlainStringFromHtml = (value: string) => {
  // check if value start with a tag
  if (value[0] !== '<') return value;
  return value
    .split('>') // Split on closing tag
    .slice(0, -1) // remove last entry from the closing tag
    .filter((element) => element[0] !== '<' && element !== '') // remove all tag element and
    .map((element) => element.split('<')[0])
    .join('');
};

export const generateSignatureHtml = (
  value: EmailSignature,
  isPreview: boolean,
  logoUrl: string,
): string | undefined => {
  if (!value?.content.html) {
    return undefined;
  }

  const imageSrc = isPreview ? logoUrl : `cid:${value?.content.images[0]}`;

  const imageHtml =
    value?.content.images &&
    value?.content.images.length > 0 &&
    value?.content.images[0] !== ''
      ? `<tr>
          <td>
            <img src="${imageSrc}" 
              alt="${value.name}" 
              style="width: 88px; max-height: 88px; border-radius: 50%; margin-right: 16px; object-fit:cover; min-height: 88px" />
          </td>
        </tr>`
      : '';

  return `
<table style="width:100%">
  <tbody style="display:flex;justify-content: space-between">
    ${imageHtml}
    <tr>
      <td>${value.content.html}</td>
    </tr>
  </tbody>
</table>
`;
};
