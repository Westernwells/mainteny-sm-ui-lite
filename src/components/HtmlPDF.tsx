import {Html, HtmlStyle, HtmlStyles} from 'react-pdf-html';
import {
  DEFAULT_HTML_PDF_FONT_SIZE,
  HTML_PDF_FONT_SIZE,
} from 'models/richTextField';
import {modifyHTMLFontSizeForPDFRendering} from 'utils/rich-text-field';

export const HtmlPDF = ({
  html,
  selectedLng,
  rootStyle,
  stylesheet,
}: {
  html: string;
  selectedLng?: string;
  rootStyle?: HtmlStyle | HtmlStyle[];
  stylesheet?: HtmlStyles | HtmlStyles[];
}) => {
  const modifiedHtmlString = modifyHTMLFontSizeForPDFRendering(html)
    // Replace tabs with spaces (4 times &nbsp;) because tabs are rendering as square boxes
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

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
        },
        '*:not(div:empty)': {
          margin: '0px',
        },
        body: {
          fontFamily:
            selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
        },
        'li > p': {
          margin: '-0.3px 0px',
        },
        'ul, ol': {
          lineHeight: '1.6px',
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
          fontSize: '9px',
        },
        [`p span[style*="font-size: ${HTML_PDF_FONT_SIZE.NORMAL}"] strong`]: {
          minHeight: '13px',
          fontSize: '11px',
        },
        [`p span[style*="font-size: ${HTML_PDF_FONT_SIZE.LARGE}"] strong`]: {
          minHeight: '15px',
          fontSize: '13px',
        },
        'p strong': {
          fontSize: '11px',
        },
        [`span[style*="font-size: ${HTML_PDF_FONT_SIZE.NORMAL}"]`]: {
          minHeight: '13px',
        },
        [`span[style*="font-size: ${HTML_PDF_FONT_SIZE.SMALL}"]`]: {
          minHeight: '11px',
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
