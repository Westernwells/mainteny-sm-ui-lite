import {useState, useCallback, useRef} from 'react';
import Box from '@mui/material/Box';
import {Document, Page, pdfjs} from 'react-pdf';
import {useIntersectionObserver} from '@wojtekmaj/react-hooks';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewWithObserverProps {
  blobUrl: string;
  scale?: number;
  onTotalPages?: (totalPages: number) => void;
  onCurrentPageChange?: (page: number) => void;
}

interface PageWithObserverProps {
  pageNumber: number;
  scale?: number;
  setPageVisibility: (pageNumber: number, isIntersecting: boolean) => void;
}

const PageWithObserver = ({
  pageNumber,
  scale,
  setPageVisibility,
}: PageWithObserverProps) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useIntersectionObserver(element, {threshold: 0}, ([entry]) => {
    Promise.resolve().then(() => {
      setPageVisibility(pageNumber, entry.isIntersecting);
    });
  });

  return (
    <div ref={setElement}>
      <Page
        pageNumber={pageNumber}
        scale={scale}
        renderMode={'svg' as any}
        renderAnnotationLayer={false}
      />
    </div>
  );
};

export const PdfPreviewWithObserver = ({
  blobUrl,
  scale = 1.428,
  onTotalPages,
  onCurrentPageChange,
}: PdfPreviewWithObserverProps) => {
  const [numPages, setNumPages] = useState<number>(0);

  const visiblePagesRef = useRef<{[page: number]: boolean}>({});

  const onDocumentLoadSuccess = useCallback(
    ({numPages: docNumPages}: {numPages: number}) => {
      setNumPages(docNumPages);
      if (onTotalPages) {
        onTotalPages(docNumPages);
      }
    },
    [onTotalPages],
  );

  const setPageVisibility = useCallback(
    (pageNumber: number, isIntersecting: boolean) => {
      visiblePagesRef.current = {
        ...visiblePagesRef.current,
        [pageNumber]: isIntersecting,
      };
      // Compute current page by choosing the smallest visible page number.
      const visible = Object.keys(visiblePagesRef.current)
        .filter((key) => visiblePagesRef.current[Number(key)])
        .map(Number);
      if (visible.length > 0) {
        const newCurrentPage = Math.min(...visible);
        onCurrentPageChange?.(newCurrentPage);
      }
    },
    [onCurrentPageChange],
  );

  return (
    <Box
      width="100%"
      overflow="hidden"
      sx={{
        overflowY: numPages > 1 ? 'scroll' : 'initial',
        '& .react-pdf__message': {margin: '1em'},
        '& .react-pdf__Page.prevPage': {
          position: 'absolute !important',
          zIndex: 1,
        },
        '& .react-pdf__Document': {minHeight: '1300px'},
        '&::-webkit-scrollbar': {width: '0.25em'},
        '&::-webkit-scrollbar-track': {background: 'transparent'},
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'action.disabled',
          borderRadius: '0.25em',
        },
      }}>
      <Document file={blobUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (_, index) => (
          <PageWithObserver
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            scale={scale}
            setPageVisibility={setPageVisibility}
          />
        ))}
      </Document>
    </Box>
  );
};

export default PdfPreviewWithObserver;
