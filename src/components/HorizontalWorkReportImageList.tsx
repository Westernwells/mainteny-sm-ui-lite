import {Box, Grid, Typography} from '@mui/material';
import React, {useState} from 'react';
import MUIDialog from '@mui/material/Dialog';
import {Carousel} from 'components/Carousel';
import {FileResourceRecord} from 'models/media';
import useTheme from '@mui/material/styles/useTheme';
import {Image} from './Image';

interface HorizontalWorkReportImageListProps {
  pictures: FileResourceRecord[];
  serviceCompanyId?: string;
  isEditing?: boolean;
  onImageDelete?: (image: FileResourceRecord, index: number) => void;
}

export const HorizontalWorkReportImageList = ({
  pictures,
  onImageDelete,
  serviceCompanyId,
  isEditing = false,
}: HorizontalWorkReportImageListProps) => {
  const [downloadUrls, setDownloadUrls] = useState<{[key: string]: string}>({});
  const [openPreview, setOpenPreview] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();

  const handleImagePress = (index: number) => {
    setOpenPreview(true);
    setActiveStep(index);
  };

  const closePreview = () => {
    setOpenPreview(false);
    setActiveStep(0);
  };

  if (!pictures.length && !isEditing) return null;

  return (
    <Box display="flex" flexWrap="nowrap" sx={{overflowX: 'auto', mb: 2}}>
      {pictures.map((picture, i) => (
        <Grid display="flex" flexDirection="column" width="fit-content">
          <Image
            serviceCompanyId={serviceCompanyId}
            onReceiveDownloadUrl={(data) =>
              setDownloadUrls((oldUrls) => ({
                ...oldUrls,
                [data.path]: data.url,
              }))
            }
            onImagePress={() => handleImagePress(i)}
            onDelete={() => onImageDelete?.(picture, i)}
            isEditing={isEditing}
            key={picture.uri === 'loading' ? i : picture.uri}
            data={picture}
          />

          <Typography
            variant="body1"
            color={theme.palette.text.primary}
            pl={1}
            mt={1}
            pr={1.75}
            sx={{
              wordBreak: 'break-word',
              textWrap: 'anywhere',
            }}>
            {picture.description}
          </Typography>
        </Grid>
      ))}

      {openPreview && (
        <MUIDialog
          onClose={closePreview}
          open={openPreview}
          maxWidth="sm"
          sx={{
            '& .MuiDialog-container > .MuiPaper-root': {
              minHeight: '50%',
              minWidth: '50%',
            },
          }}>
          <Carousel
            images={pictures.map((p) => ({
              label: p.description,
              imgPath: downloadUrls[p.uri],
            }))}
            onClose={closePreview}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        </MUIDialog>
      )}
    </Box>
  );
};
