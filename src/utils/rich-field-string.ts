import {EmailSignature} from 'models/employee';
import {stripHtmlTags} from './text-block';

export const isPlainString = (value: string) => !/<[^>]+>/.test(value);

// Remove all html tags and return single line string
export const getPlainStringFromHtml = (value: string): string => {
  if (!value.startsWith('<')) return value;
  const doc = new DOMParser().parseFromString(value, 'text/html');
  return doc.body.textContent?.trim() ?? '';
};

export const generateSignatureHtml = (
  value: EmailSignature,
  isPreview: boolean,
  logoUrl?: string,
): string | undefined => {
  if (!value?.content?.html) return undefined;

  const imageSrc = isPreview ? logoUrl : `cid:${value?.content?.images?.[0]}`;

  const imageHtml =
    value?.content?.images &&
    value?.content?.images.length > 0 &&
    value?.content?.images[0] !== ''
      ? `
        <td style="width: 88px;vertical-align: top;padding-right:16px">
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
        </td>
      `
      : '';

  // Add data-signature="true" to uniquely identify the signature
  return `
<table data-signature="true" style="border-collapse: separate; width: 100%; table-layout: fixed; border-spacing: 0 50px">
  <tr>
    ${imageHtml}
    <td class="html-content" style="vertical-align: top; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #000;">
      ${value.content.html}
    </td>
  </tr>
</table>
`;
};

export function removeHtmlTags(str: string) {
  // Handle <p> tags with non-breaking space
  str = str.replace(/<p[^>]*>&nbsp;<\/p>/gi, '');

  str = str.replace(/&nbsp;/gi, '');

  // Remove all other HTML tags
  return str.replace(/<\/?[^>]+(>|$)/g, '');
}

export const handleSignatureSmartly = (
  emailContent: string,
  cidImageUrl?: string,
): string => {
  // 1. Find the last <table> in the content (assuming signature block)
  const lastTableRegex = /<table[\s\S]*?<\/table>/gi;
  const tables = [...emailContent.matchAll(lastTableRegex)];
  const lastTableMatch = tables.length ? tables[tables.length - 1][0] : null;

  if (!lastTableMatch) return emailContent.trim(); // If no table found, return content as-is

  // 2. Extract all <td> contents
  const tdContentRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const tdMatches = [...lastTableMatch.matchAll(tdContentRegex)];
  const tdContents = tdMatches.map((match) => match[1]?.trim());

  const firstTdContent = tdContents[0] || '';
  const secondTdContent = tdContents[1] || '';

  // 3. Clean content check
  const cleanContent = (html: string) =>
    html.replace(/&nbsp;|\s|<br\s*\/?>|<p[^>]*>(\s|&nbsp;)*<\/p>/gi, '').trim();

  const isFirstTdEmpty = cleanContent(firstTdContent) === '';
  const isSecondTdEmpty = cleanContent(secondTdContent) === '';

  // 4. Check if first TD contains image
  const containsImage = /<img\s[^>]*src=/.test(firstTdContent);

  // 5. Prepare image URL if valid
  const finalCidImageUrl =
    cidImageUrl && cidImageUrl !== 'undefined' ? `cid:${cidImageUrl}` : '';
  const hasValidImage = !!finalCidImageUrl;

  let rebuiltSignature = '';

  // CASE 1: Both empty -> Remove the entire table (user deleted everything)
  if (isFirstTdEmpty && (isSecondTdEmpty || tdContents.length === 1)) {
    return emailContent.replace(lastTableMatch, '').trim();
  }

  // CASE 2: Single TD cases
  if (tdContents.length === 1) {
    if (containsImage && hasValidImage) {
      // ✅ Image only case, single TD
      rebuiltSignature = `
        <table data-signature="true" style="border-collapse: separate; width: 100%; table-layout: fixed; border-spacing: 0 50px;">
          <tr style="width: 100%; padding-right: 1em;">
            <td style="width: 88px; vertical-align: top; padding-right: 16px;">
              <img src="${finalCidImageUrl}"
                alt="Signature Image"
                style="width: 88px; height: 88px; max-height: 88px; border-radius: 50%; object-fit: cover; display: block;" />
            </td>
          </tr>
        </table>`.trim();
    } else if (!isFirstTdEmpty && !containsImage) {
      // ✅ Text only case, single TD
      rebuiltSignature = `
        <table data-signature="true" style="border-collapse: separate; width: 100%; table-layout: fixed; border-spacing: 0 50px;">
          <tr style="width: 100%; padding-right: 1em;">
            <td class="html-content" style="vertical-align: top; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #000; width: 100%;">
              ${firstTdContent}
            </td>
          </tr>
        </table>`.trim();
    } else {
      // Image present but invalid/no image URL - remove signature
      return emailContent.replace(lastTableMatch, '').trim();
    }
  }

  // CASE 3: Two TDs (image + text or variations)
  if (tdContents.length === 2) {
    // Image + Text, both valid and image URL present
    if (containsImage && !isSecondTdEmpty && hasValidImage) {
      rebuiltSignature = `
        <table data-signature="true" style="border-collapse: separate; width: 100%; table-layout: fixed; border-spacing: 0 50px;">
          <tr style="width: 100%; padding-right: 1em;">
            <td style="width: 88px; vertical-align: top; padding-right: 16px;">
              <img src="${finalCidImageUrl}"
                alt="Signature Image"
                style="width: 88px; height: 88px; max-height: 88px; border-radius: 50%; object-fit: cover; display: block;" />
            </td>
            <td class="html-content" style="vertical-align: top; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #000; width: 100%;">
              ${secondTdContent}
            </td>
          </tr>
        </table>`.trim();
    }
    // Only text in second TD
    else if (isFirstTdEmpty && !isSecondTdEmpty) {
      rebuiltSignature = `
        <table data-signature="true" style="border-collapse: separate; width: 100%; table-layout: fixed; border-spacing: 0 50px;">
          <tr style="width: 100%; padding-right: 1em;">
            <td class="html-content" style="vertical-align: top; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #000; width: 100%;">
              ${secondTdContent}
            </td>
          </tr>
        </table>`.trim();
    }
    // Image + text, but image invalid -> Keep text only
    else if (containsImage && !isSecondTdEmpty && !hasValidImage) {
      rebuiltSignature = `
        <table data-signature="true" style="border-collapse: separate; width: 100%; table-layout: fixed; border-spacing: 0 50px;">
          <tr style="width: 100%; padding-right: 1em;">
            <td class="html-content" style="vertical-align: top; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #000; width: 100%;">
              ${secondTdContent}
            </td>
          </tr>
        </table>`.trim();
    }
  }

  // Final replacement if we have rebuilt signature
  if (rebuiltSignature) {
    return emailContent
      .replace(lastTableMatch, `<br />${rebuiltSignature}`)
      .trim();
  }

  // Fallback - leave as is
  return emailContent;
};

export const cleanHtml = (html?: string) => {
  const raw = html ?? '';
  const plain = stripHtmlTags(raw).trim();
  return {raw, plain};
};
