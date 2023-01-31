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
  const [height, setHeight] = useState('100%');
  const [pages, setPages] = useState<number>(0);

  const pageRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({numPages}: {numPages: number}) {
    setPages(numPages);
  }

  return (
    <PageCard>
      <Box
        width="100%"
        overflow="hidden"
        sx={{
          height,
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
              <Page
                key={i}
                renderTextLayer={false}
                pageIndex={i}
                inputRef={pageRef}
                onRenderSuccess={() => {
                  setHeight(
                    pageRef.current
                      ? `${pageRef.current!.clientHeight}px !important`
                      : '100%',
                  );
                }}
              />
            ))}
        </Document>
      </Box>
    </PageCard>
  );
};
