import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {PDFContainer} from 'components/PDFContainer';

export const PDFPreview = ({pdfUrl}: {pdfUrl: string}) => {
  const theme = useTheme();
  return (
    <Box
      bgcolor="white"
      width="100%"
      maxWidth="50rem"
      mx="auto"
      mb="8em"
      mt="1.5em"
      p={2}
      borderRadius="4px">
      <Box p={2.5} pt={3} bgcolor={theme.palette.inputBackground.main}>
        <PDFContainer url={pdfUrl} />
      </Box>
    </Box>
  );
};
