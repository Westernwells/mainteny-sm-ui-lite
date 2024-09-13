import {Html, HtmlStyle, HtmlStyles} from 'react-pdf-html';
import {grey} from '@mui/material/colors';
import {DEFAULT_HTML_PDF_FONT_SIZE} from 'models/richTextField';
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
  const modifiedHtmlString = modifyHTMLFontSizeForPDFRendering(html);
  return (
    <Html
      collapse={false}
      style={{
        fontSize: DEFAULT_HTML_PDF_FONT_SIZE,
        ...rootStyle,
      }}
      stylesheet={{
        '*': {
          color: grey[700],
          margin: '0px',
        },
        body: {
          fontFamily:
            selectedLng === 'ka-ge' ? 'NotoSans-Regular' : 'Montserrat-Regular',
        },
        p: {
          margin: '2px 0px',
        },
        'li > p': {
          margin: '-0.3px 0px',
        },
        li: {
          margin: '2px 0px',
        },
        'p:empty, ul, ol': {
          margin: '8px 0px',
        },
        ...stylesheet,
      }}>
      {modifiedHtmlString}
    </Html>
  );
};
