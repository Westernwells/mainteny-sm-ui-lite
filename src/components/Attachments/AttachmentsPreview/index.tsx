import MUIDialog from '@mui/material/Dialog';
import {Carousel} from 'components/Carousel';
import React, {useEffect, useMemo, useState} from 'react';
import {isAttachmentPreviewableImage} from 'utils/attachment';
import {AttachmentView} from 'models/attachment';

type Props = {
  files: AttachmentView[];
  previewFile?: AttachmentView;
  downloadUrls: Record<string, string>;
  setPreviewFile: (value: AttachmentView | undefined) => void;
};

const AttachmentsPreview = ({
  previewFile,
  files,
  downloadUrls,
  setPreviewFile,
}: Props) => {
  const [activeStep, setActiveStep] = useState(0);
  const isOpen = Boolean(previewFile);

  const images = useMemo(
    () => files?.filter((file) => isAttachmentPreviewableImage(file)),
    [files],
  );

  // update step in the carousel on open file preview
  useEffect(() => {
    if (previewFile) {
      const index = images.findIndex(
        (attachment) => attachment.id === previewFile?.id,
      );

      setActiveStep(index || 0);
    }
  }, [previewFile]);

  const handleClosePreview = () => {
    setPreviewFile(undefined);
  };

  return (
    <MUIDialog
      onClose={handleClosePreview}
      open={isOpen}
      maxWidth="md"
      sx={{
        '& .MuiDialog-container > .MuiPaper-root': {
          minHeight: '50%',
          minWidth: '50%',
          '& > div:nth-of-type(2)': {
            overflowY: 'hidden',
          },
        },
      }}>
      <Carousel
        images={images?.map((attachment) => ({
          label: attachment.name,
          imgPath: downloadUrls[attachment.uri || ''],
        }))}
        onClose={handleClosePreview}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />
    </MUIDialog>
  );
};

export default AttachmentsPreview;
