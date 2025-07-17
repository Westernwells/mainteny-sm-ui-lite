import React, {useState} from 'react';
import {useLocation} from 'react-router-dom';
import {Document, Page, pdfjs} from 'react-pdf';
import {Box, CircularProgress, Typography} from '@mui/material';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

export const PdfViewer: React.FC = () => {
  const {search} = useLocation();
  const filename = new URLSearchParams(search).get('filename');
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const onDocumentLoadSuccess = ({numPages: pageCount}: {numPages: number}) => {
    setNumPages(pageCount);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setLoading(false);
  };

  if (!filename) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh">
        <Typography variant="h6" color="error">
          No PDF filename provided
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
      {loading && (
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <CircularProgress size={24} />
          <Typography>Loading PDF...</Typography>
        </Box>
      )}

      <Document
        file={`/${filename}`}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        }>
        {numPages &&
          Array.from(new Array(numPages), (el, index) => (
            <Box key={`page_${index + 1}`} mb={2}>
              <Page
                pageNumber={index + 1}
                scale={1.2}
                renderTextLayer
                renderAnnotationLayer={false}
              />
            </Box>
          ))}
      </Document>
    </Box>
  );
};
