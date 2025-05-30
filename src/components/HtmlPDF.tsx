import {Html, HtmlStyle, HtmlStyles} from 'react-pdf-html';
import {HTML_PDF_FONT_SIZE} from 'models/richTextField';
import {
  flattenTableHtml,
  generateTextIndent,
  modifyHTMLFontSizeForPDFRendering,
  normalizePdfInlineStyles,
} from 'utils/rich-text-field';
import {ContextProps} from 'context/PdfStylesProvider';

type Props = {
  html: string;
  rootStyle?: HtmlStyle | HtmlStyle[];
  stylesheet?: HtmlStyles | HtmlStyles[];
  fontSize?: Record<'NORMAL' | 'SMALL' | 'LARGE', string>;
} & Pick<ContextProps, 'fontStyles'>;

export const HtmlPDF = ({
  html,
  rootStyle,
  stylesheet,
  fontStyles,
  fontSize: explicitFontSize,
}: Props) => {
  // 1) Flatten table html
  const withoutTables = flattenTableHtml(html);

  // 2) indent
  const indented = generateTextIndent(withoutTables);

  // 3) normalize only the paddings
  const normalized = normalizePdfInlineStyles(indented);

  // 4) bump font-sizes
  const sized = modifyHTMLFontSizeForPDFRendering(normalized);

  // 5) tabs → &nbsp;
  const modifiedHtmlString = sized.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

  const fontSize = explicitFontSize ?? HTML_PDF_FONT_SIZE;

  const DEFAULT_HTML_PDF_FONT_SIZE = fontSize.NORMAL;

  return (
    <Html
      collapse={false}
      style={{
        fontSize: DEFAULT_HTML_PDF_FONT_SIZE,
        ...rootStyle,
      }}
      stylesheet={{
        '*': {
          fontSize: DEFAULT_HTML_PDF_FONT_SIZE,
          fontFamily: fontStyles.regular.fontFamily,
        },
        '*:not(div:empty)': {
          margin: '0px',
        },
        body: {
          fontFamily: fontStyles.regular.fontFamily,
        },
        'li > p': {
          margin: '-0.3px 0px',
        },
        'ul, ol': {
          lineHeight: '1.6',
          padding: '10px 0px',
        },
        li: {
          fontSize: '11px',
        },
        'div:empty': {
          margin: '8px 0px',
        },
        'div span:empty': {
          margin: '8px 0px',
        },
        'p:empty': {
          padding: '8px 0px',
        },
        [`p span[style*="font-size: ${HTML_PDF_FONT_SIZE.SMALL}"] strong`]: {
          minHeight: '11px',
          fontSize: fontSize.SMALL,
        },
        [`p span[style*="font-size: ${HTML_PDF_FONT_SIZE.NORMAL}"] strong`]: {
          minHeight: '13px',
          fontSize: fontSize.NORMAL,
        },
        [`p span[style*="font-size: ${HTML_PDF_FONT_SIZE.LARGE}"] strong`]: {
          minHeight: '15px',
          fontSize: fontSize.LARGE,
        },
        'p strong': {
          fontSize: '10px',
        },
        [`span[style*="font-size: ${HTML_PDF_FONT_SIZE.SMALL}"]`]: {
          minHeight: '11px',
        },
        [`span[style*="font-size: ${HTML_PDF_FONT_SIZE.NORMAL}"]`]: {
          minHeight: '13px',
        },
        [`span[style*="font-size: ${HTML_PDF_FONT_SIZE.LARGE}"]`]: {
          minHeight: '15px',
        },
        ...stylesheet,
      }}>
      {modifiedHtmlString}
    </Html>
  );
};
