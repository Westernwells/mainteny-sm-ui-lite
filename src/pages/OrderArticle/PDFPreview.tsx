import Box from '@mui/material/Box';
import React, {useRef, useState} from 'react';
import {Document, Page, pdfjs} from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// https://github.com/wojtekmaj/react-pdf/issues/321#issuecomment-451291757
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
if (window.Cypress) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
}
type Props = {
  blobUrl: string;
};

const PdfPreview = ({blobUrl}: Props) => {
  const [pages, setPages] = useState<number>(0);
  const pageRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({numPages}: {numPages: number}) {
    setPages(numPages);
  }

  return (
    <div>
      {blobUrl && (
        <Box
          width="100%"
          overflow="hidden"
          sx={{
            overflowY: pages > 1 ? 'scroll' : 'initial',
            '& .react-pdf__message': {
              margin: '1em',
            },
            '& .react-pdf__Page.prevPage': {
              position: 'absolute !important',
              zIndex: 1,
            },
            '& .react-pdf__Document': {
              minHeight: '1300px',
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
          <Document file={blobUrl} onLoadSuccess={onDocumentLoadSuccess}>
            {pages &&
              [...Array(pages).keys()].map((index) => (
                <div
                  key={`page_${index + 1}`}
                  style={{
                    marginBottom: '2em',
                  }}>
                  <Page
                    pageNumber={index + 1}
                    renderMode="canvas"
                    pageIndex={index}
                    renderAnnotationLayer={false}
                    inputRef={pageRef}
                    scale={1.428}
                  />
                </div>
              ))}
          </Document>
        </Box>
      )}
    </div>
  );
};

export default PdfPreview;
