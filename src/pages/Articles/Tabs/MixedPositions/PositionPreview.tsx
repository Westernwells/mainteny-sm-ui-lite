import {useState} from 'react';
import {Box, Button, Grid, Typography} from '@mui/material';
import PdfPreview from 'pages/OrderArticle/PDFPreview';
import {zoomButtonStyles} from './MixedPosition.styles';

const ZOOM_LIMITS = {min: 50, max: 200, step: 10};

const PositionPreview = ({
  filePathToDownload,
}: {
  filePathToDownload: string;
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const handleZoomIn = () =>
    setZoomLevel((prev) => Math.min(prev + ZOOM_LIMITS.step, ZOOM_LIMITS.max));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - ZOOM_LIMITS.step, ZOOM_LIMITS.min));

  return (
    <Grid container spacing={2} justifyContent="center">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          overflowY: 'auto',
          overflowX: 'auto',
          maxWidth: '750px',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left',
          transition: 'transform 0.2s ease-in-out',
          zIndex: 1000,
          backgroundColor: 'white',
          marginTop: '-9em',
        }}>
        <PdfPreview blobUrl={filePathToDownload} scale={1.3} />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          position: 'absolute',
          right: '38px',
          bottom: '44px',
          zIndex: 1000,
        }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 'bold',
            borderRadius: '4px',
            boxShadow: '0px 4px 15px 0px #90909033',
            padding: '0.5em 1em',
            background: 'white',
            zIndex: 10,
          }}>
          {zoomLevel}%
        </Typography>

        <Button
          onClick={handleZoomIn}
          sx={{
            ...zoomButtonStyles,
          }}>
          +
        </Button>

        <Button
          onClick={handleZoomOut}
          sx={{
            ...zoomButtonStyles,
          }}>
          -
        </Button>
      </Box>
    </Grid>
  );
};

export default PositionPreview;
