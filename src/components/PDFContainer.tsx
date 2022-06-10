import Box from '@mui/material/Box';
import {PageCard} from 'components/PageCard';
import {Document, Page, pdfjs} from 'react-pdf/dist/esm/entry.webpack';

// https://github.com/wojtekmaj/react-pdf/issues/321#issuecomment-451291757
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props {
  url: string;
}

export const PDFContainer = ({url}: Props) => (
  <PageCard>
    <Box
      width="100%"
      overflow="hidden"
      sx={{
        '& .react-pdf__Page__canvas': {
          margin: '0 auto',
          width: '100% !important',
          height: '100% !important',
        },
      }}>
      <Document file={url}>
        <Page renderTextLayer={false} pageNumber={1} />
      </Document>
    </Box>
  </PageCard>
);
