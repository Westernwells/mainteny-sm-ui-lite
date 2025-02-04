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
      ? `
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
          style="height:88px; width:88px; v-text-anchor:middle;" arcsize="50%" strokecolor="none" fill="t">
          <v:fill src="${imageSrc}" type="frame" />
          <w:wrap type="none" />
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-- -->
        <img src="${imageSrc}" 
          alt="${value.name}" 
          style="width: 88px; height: 88px; max-height: 88px; border-radius: 50%; object-fit: cover; display: block;" />
        <!--<![endif]-->
      `
      : '';

  return `
<table style="border-collapse: separate; width: 100%; table-layout: fixed;border-spacing: 0 50px">
  <tr>
    ${
      imageHtml
        ? `
        <td style="width: 88px;vertical-align: top;padding-right:16px">
          ${imageHtml}
        </td>`
        : ''
    }
    <td class="html-content" style="vertical-align: top; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #000;">
      ${value.content.html}
    </td>
  </tr>
</table>
`;
};
