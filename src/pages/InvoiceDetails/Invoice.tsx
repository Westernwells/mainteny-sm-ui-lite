import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {Document, Page, pdfjs} from 'react-pdf/dist/esm/entry.webpack';

// https://github.com/wojtekmaj/react-pdf/issues/321#issuecomment-451291757
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props {
  containerStyle?: {[key: string]: string | number};
  // TODO: Resolve null type here
  downloadUrl?: string | null;
}

export const Invoice = ({containerStyle, downloadUrl}: Props) => {
  const theme = useTheme();
  return (
    <Box display="flex" justifyContent="center">
      <Box
        sx={{
          backgroundColor: theme.palette.inputBackground.main,
          p: '1em',
          width: '44vw',
          ...containerStyle,
        }}>
        <Box width="100%">
          <Document file={downloadUrl}>
            <Page renderTextLayer={false} pageNumber={1} />
          </Document>
        </Box>
      </Box>
    </Box>
  );
};
