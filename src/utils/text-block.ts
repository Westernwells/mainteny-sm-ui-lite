import {TextBlockView, TextBlockCategory} from 'models/text-block';

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

export const stripHtmlTags = (html: string) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};
