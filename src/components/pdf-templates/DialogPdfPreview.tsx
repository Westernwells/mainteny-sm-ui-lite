import {Box, Typography} from '@mui/material';
import {Button} from 'components/Button';
import PdfPreviewWithObserver from 'components/PdfPreviewWithObserver';
import {zoomButtonStyles} from 'pages/Articles/Tabs/MixedPositions/MixedPosition.styles';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

type Props = {
  filePathToDownload: string;
};

const ZOOM_LIMITS = {min: 50, max: 200, step: 10};

export const DialogPdfPreview = ({filePathToDownload}: Props) => {
  const {t} = useTranslation();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleZoomIn = () =>
    setZoomLevel((prev) => Math.min(prev + ZOOM_LIMITS.step, ZOOM_LIMITS.max));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - ZOOM_LIMITS.step, ZOOM_LIMITS.min));

  return (
    <Box sx={{width: '100%', height: '100%', overflow: 'auto'}}>
      <Box
        sx={{
          display: 'inline-block',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left',
          transition: 'transform 0.2s ease-in-out',
          marginLeft: '-2em',
        }}>
        <PdfPreviewWithObserver
          blobUrl={filePathToDownload}
          scale={1.27}
          onTotalPages={setTotalPages}
          onCurrentPageChange={setCurrentPage}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          right: '340px',
          bottom: '85px',
          zIndex: 1000,
        }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 'bold',
            borderRadius: '4px',
            background: '#E4EBF7',
            zIndex: 10,
            color: '#121212',
            boxShadow:
              '0px 1px 10px 0px #0000001F, 0px 4px 5px 0px #00000024, 0px 2px 4px -1px #00000033',
            padding: '0.5em 1em',
          }}>
          {t('Page')} {currentPage} / {totalPages}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          right: '40px',
          bottom: '85px',
          zIndex: 1000,
        }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 'bold',
            borderRadius: '4px',
            boxShadow:
              '0px 1px 10px 0px #0000001F, 0px 4px 5px 0px #00000024, 0px 2px 4px -1px #00000033',
            padding: '0.5em 1em',
            background: 'white',
            zIndex: 10,
          }}>
          {zoomLevel}%
        </Typography>

        <Button
          label="+"
          buttonProps={{
            onClick: handleZoomIn,
            sx: zoomButtonStyles,
          }}
        />

        <Button
          label="-"
          buttonProps={{
            onClick: handleZoomOut,
            sx: zoomButtonStyles,
          }}
        />
      </Box>
    </Box>
  );
};

export default DialogPdfPreview;
