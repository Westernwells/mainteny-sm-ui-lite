import {useRef, useState} from 'react';
import Box from '@mui/material/Box';
import {PageCard} from 'components/PageCard';
import {Document, Page, pdfjs} from 'react-pdf/dist/esm/entry.vite';

// https://github.com/wojtekmaj/react-pdf/issues/321#issuecomment-451291757
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props {
  url: string;
}

export const PDFContainer = ({url}: Props) => {
  const [pages, setPages] = useState<number>(0);

  const pageRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({numPages}: {numPages: number}) {
    setPages(numPages);
  }
  return (
    <PageCard
      containerStyles={{boxShadow: 'none'}}
      contentContainerStyles={{
        background: '#f2f6f8',
        boxShadow: 'none',
        padding: '16px',
        mx: '0em',
      }}>
      <Box
        width="100%"
        overflow="hidden"
        sx={{
          overflowY: pages > 1 ? 'scroll' : 'initial',

          '& .react-pdf__Page__canvas': {
            margin: '0 auto',
            width: '100% !important',
            height: '100% !important',
            overflowY: 'hidden',
          },
          '&::-webkit-scrollbar': {
            width: '0.25em',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'action.disabled',
            borderRadius: '0.25em',
          },
        }}>
        <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
          {pages &&
            [...Array(pages).keys()].map((i) => (
              <div
                key={i}
                style={{
                  marginBottom: '2em',
                  background: 'rgb(247, 249, 252)',
                  padding: '2em',
                  border: '40px solid white',
                }}>
                <Page
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  pageIndex={i}
                  inputRef={pageRef}
                />
              </div>
            ))}
        </Document>
      </Box>
    </PageCard>
  );
};
