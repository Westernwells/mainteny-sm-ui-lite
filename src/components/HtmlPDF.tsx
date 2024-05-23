import {Html, HtmlStyles} from 'react-pdf-html';
import {grey} from '@mui/material/colors';
import {DEFAULT_HTML_PDF_FONT_SIZE} from 'models/richTextField';
import {modifyHTMLFontSizeForPDFRendering} from 'utils/rich-text-field-utils';
import {CSSProperties} from 'react';

export const HtmlPDF = ({
  html,
  selectedLng,
  rootStyle,
  stylesheet,
}: {
  html: string;
  selectedLng?: string;
  rootStyle?: CSSProperties;
  stylesheet?: HtmlStyles | HtmlStyles[];
}) => {
  const modifiedHtmlString = modifyHTMLFontSizeForPDFRendering(html);
  return (
    <Html
      style={{
        fontSize: DEFAULT_HTML_PDF_FONT_SIZE,
        marginVertical: '16px',
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
        'p:empty, ul, ol': {
          margin: '8px 0px',
        },
        ...stylesheet,
      }}>
      {modifiedHtmlString}
    </Html>
  );
};
