import {Box} from '@mui/material';
import {CheckListComponentView} from 'models/checklist';
import {FileResourceRecord} from 'models/media';
import {useState} from 'react';
import MUIDialog from '@mui/material/Dialog';
import {Carousel} from 'components/Carousel';
import {Image} from '../Image';

interface Props {
  isEditing?: boolean;
  component: CheckListComponentView;
  serviceCompanyId?: string;
  onImageDelete?: (image: FileResourceRecord, index: number) => void;
}

export const HorizontalChecklistImageList = ({
  component,
  onImageDelete,
  serviceCompanyId,
  isEditing = false,
}: Props) => {
  const pictures = component.additionalInfo.pictures ?? [];
  const [downloadUrls, setDownloadUrls] = useState<{[key: string]: string}>({});
  const [openPreview, setOpenPreview] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleImagePress = (index: number) => {
    setOpenPreview(true);
    setActiveStep(index);
  };

  const closePreview = () => {
    setOpenPreview(false);
    setActiveStep(0);
  };

  if (!pictures.length) return null;

  return (
    <Box display="flex" flexWrap="nowrap" sx={{overflowX: 'auto'}}>
      {pictures.map((item, i) => (
        <Image
          serviceCompanyId={serviceCompanyId}
          onReceiveDownloadUrl={(data) => {
            setDownloadUrls((oldUrls) => ({...oldUrls, [data.path]: data.url}));
          }}
          onImagePress={() => handleImagePress(i)}
          onDelete={() => onImageDelete?.(item, i)}
          isEditing={isEditing}
          key={item.uri === 'loading' ? i : item.uri}
          data={item}
        />
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
            images={pictures?.map((p) => ({
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
