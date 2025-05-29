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
            style="width: 88px; max-height: 88px; object-fit: contain; display: block; border: 1px solid #dddddd" />
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
  const hasImageTag = /<img\s[^>]*src=/.test(firstTdContent);

  // 5. Prepare image URL if valid
  const finalCid =
    cidImageUrl && cidImageUrl !== 'undefined' ? `cid:${cidImageUrl}` : '';

  const renderImageCell = () =>
    `
    <td
      width="88" height="88"
      style="width:88px;height:88px;padding-right:16px;vertical-align:top;"
      align="center" valign="middle"
    >
      <!--[if mso]>
      <v:rect xmlns:v="urn:schemas-microsoft-com:vml"
        style="width:88px;height:88px;" stroke="false" fill="true">
        <v:fill type="frame" src="${finalCid}" />
      </v:rect>
      <![endif]-->

      <!--[if !mso]><!-->
      <table
        width="88" height="88"
        cellpadding="0" cellspacing="0" border="0"
        style="width:88px;height:88px;"
      >
        <tr>
          <td
            align="center" valign="top"
            style="text-align:center;vertical-align:top;"
          >
            <img
              src="${finalCid}"
              alt="Signature Image"
              style="
                display:block;
                max-width:88px;
                max-height:88px;
                min-height: 0px;
              "
            />
          </td>
        </tr>
      </table>
      <!--<![endif]-->
    </td>`.trim();

  // CASE 1: both cells empty → remove entire signature block
  if (isFirstTdEmpty && (isSecondTdEmpty || tdContents.length === 1)) {
    return emailContent.replace(lastTableMatch, '').trim();
  }

  let rebuilt = '';

  // CASE 2: single‐cell signature
  if (tdContents.length === 1) {
    // image only
    if (hasImageTag && finalCid) {
      rebuilt = `
        <table data-signature="true"
          style="border-collapse:separate;width:100%;table-layout:fixed;border-spacing:0 50px;"
        >
          <tr style="width:100%;padding-right:1em;">
            ${renderImageCell()}
          </tr>
        </table>
      `.trim();
    }
    // text only
    else if (!isFirstTdEmpty && !hasImageTag) {
      rebuilt = `
        <table data-signature="true"
          style="border-collapse:separate;width:100%;table-layout:fixed;border-spacing:0 50px;"
        >
          <tr style="width:100%;padding-right:1em;">
            <td class="html-content"
              style="vertical-align:top;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#000;width:100%;"
            >
              ${firstTdContent}
            </td>
          </tr>
        </table>
      `.trim();
    } else {
      return emailContent.replace(lastTableMatch, '').trim();
    }
  }

  // CASE 3: two‐cell signature
  if (tdContents.length === 2) {
    // image + text
    if (hasImageTag && !isSecondTdEmpty && finalCid) {
      rebuilt = `
        <table data-signature="true"
          style="border-collapse:separate;width:100%;table-layout:fixed;border-spacing:0 50px;"
        >
          <tr style="width:100%;padding-right:1em;">
            ${renderImageCell()}
            <td class="html-content"
              style="vertical-align:top;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#000;width:100%;"
            >
              ${secondTdContent}
            </td>
          </tr>
        </table>
      `.trim();
    }
    // text only in second cell
    else if (isFirstTdEmpty && !isSecondTdEmpty) {
      rebuilt = `
        <table data-signature="true"
          style="border-collapse:separate;width:100%;table-layout:fixed;border-spacing:0 50px;"
        >
          <tr style="width:100%;padding-right:1em;">
            <td class="html-content"
              style="vertical-align:top;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#000;width:100%;"
            >
              ${secondTdContent}
            </td>
          </tr>
        </table>
      `.trim();
    }
    // image present but no valid CID → drop image, keep text
    else if (hasImageTag && !isSecondTdEmpty && !finalCid) {
      rebuilt = `
        <table data-signature="true"
          style="border-collapse:separate;width:100%;table-layout:fixed;border-spacing:0 50px;"
        >
          <tr style="width:100%;padding-right:1em;">
            <td class="html-content"
              style="vertical-align:top;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#000;width:100%;"
            >
              ${secondTdContent}
            </td>
          </tr>
        </table>
      `.trim();
    }
  }

  // final replace
  return rebuilt
    ? emailContent.replace(lastTableMatch, `<br />${rebuilt}`).trim()
    : emailContent;
};

export const cleanHtml = (html?: string) => {
  const raw = html ?? '';
  const plain = stripHtmlTags(raw).trim();
  return {raw, plain};
};
