import {TextBlockCategory, TextBlockView} from 'models/text-block';
import {getPlainStringFromHtml} from 'utils/rich-field-string';

export const mapJsonToTextBlockView = (json: any): TextBlockView => ({
  id: json.id,
  serviceCompanyId: json.serviceCompanyId,
  category: json.CATEGORY,
  name: json.NAME,
  text: json.text,
  search: json.search,
  additionalInfo: json.additionalInfo,
  meta: json.meta,
});

// Converts macro to text, eg: ' SERVICE_ORDER' -> 'Job Detailsr'

export const convertCategoryToText = (macro: string) => {
  const specialCases: {[key: string]: string} = {
    SERVICE_ORDER_REPORT: 'Work Report',
    SERVICE_ORDER: 'Job Details',
  };

  if (specialCases[macro]) {
    return specialCases[macro];
  }

  return macro
    .toLowerCase()
    .split('_')
    .join(' ')
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
};

// Converts category text to macro, eg: 'Work Report' -> 'SERVICE_ORDER_REPORT'
export const convertCategoryToMacro = (
  text: string,
): TextBlockCategory | string => {
  const specialCases: {[key: string]: TextBlockCategory} = {
    'Work Report': TextBlockCategory.SERVICE_ORDER_REPORT,
    'Job Details': TextBlockCategory.SERVICE_ORDER,
  };

  if (specialCases[text]) {
    return specialCases[text];
  }

  return text.toUpperCase().split(' ').join('_');
};

export const textBlockCategoryOptions = Object.values(TextBlockCategory).map(
  (category) => convertCategoryToText(category),
);

export const stripHtmlTags = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  function getText(node: Node): string {
    let text = '';
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const {childNodes} = node;
      for (let i = 0; i < childNodes.length; i += 1) {
        const childText = getText(childNodes[i]);
        if (childText.length > 0) {
          text += `${childText} `;
        }
      }
    }
    return text.trim(); // Trim leading and trailing spaces
  }

  const textContent = getText(tmp);

  // Replace consecutive spaces with a single space
  return textContent.replace(/\s+/g, ' ').trim();
};

export const cleanHtmlContent = (html: string): string => {
  // Clean up list HTML
  html = html.replaceAll(
    /<li><p>(.*?)<\/p><(\/?)(ol|li|ul)>/gi,
    '<li>$1<$2$3>',
  );

  // Add styles to <tbody> to support positioning of the signature
  html = html.replace(
    '<tbody>',
    '<tbody style="display: flex; justify-content: space-between; width: 100%;">',
  );

  html = html.replace(/<tr>/g, '<tr style="width: 100%; padding-right: 1em;">');

  // Dynamically handle <td> based on child count and content
  html = html.replace(
    /<tr(.*?)>(.*?)<\/tr>/gis,
    (match, trAttributes, trContent) => {
      const tdMatches = trContent.match(/<td(.*?)>(.*?)<\/td>/gis) || [];

      // Process each <td> dynamically
      return `<tr${trAttributes}>${tdMatches
        .map((tdMatch: string, index: number) => {
          const tdContent = tdMatch
            .replace(/<td(.*?)>/, '')
            .replace('</td>', '')
            .trim();
          const isEmpty = tdContent === '' || tdContent === '<p><br></p>';
          const style =
            index === 1
              ? 'width: 100%;'
              : isEmpty
              ? 'width: 0px;' // Hide empty first <td>
              : 'padding-right: 16px;'; // Visible first <td>

          return tdMatch.includes('style=')
            ? tdMatch.replace(/style="(.*?)"/, `style="$1; ${style}"`)
            : `<td style="${style}">${tdContent}</td>`;
        })
        .join('')}</tr>`;
    },
  );

  // Replace empty <p> tags with a non-breaking space
  html = html.replace(/<p([^>]*)>\s*<\/p>/gi, '<p$1>&nbsp;</p>');

  return html;
};

// Function to escape special regex characters in the string
const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Function to encode double quotes to &quot;
const encodeDoubleQuotes = (str: string) => str.replace(/"/g, '&quot;');

export const replaceTextInHtml = (
  html: string,
  text: string,
  replaceWith: string,
) => {
  // Encode the text
  const encodedText = encodeDoubleQuotes(text);

  // Escape for use in regex
  const escapedEncodedText = escapeRegExp(encodedText);

  // Create a global regex
  const regex = new RegExp(escapedEncodedText, 'g');

  // Perform the replacement
  const replacedHtml = html.replace(regex, replaceWith);
  return replacedHtml;
};

export const getUpdatedTextBlockValue = (
  currentValue: string,
  valueToAdd: string,
) => {
  // Remove first line if its empty
  const plainTextValue = getPlainStringFromHtml(currentValue);
  const isCurrentEmpty = plainTextValue === '&nbsp;' || plainTextValue === '';

  return cleanHtmlContent(
    `${isCurrentEmpty ? '' : currentValue} ${valueToAdd}`.trim(),
  );
};
