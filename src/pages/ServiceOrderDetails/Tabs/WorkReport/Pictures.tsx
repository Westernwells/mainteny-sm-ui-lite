import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import {EmptySection} from 'components/EmptySection';
import {olStyles} from 'styles';
import {
  ServiceOrderReportAttachmentView,
  ServiceOrderReportView,
  ServiceOrderView,
} from 'models/service-order';
import {HorizontalWorkReportImageList} from 'components/HorizontalWorkReportImageList';
import {IMAGE_SIZE_IN_MB} from 'utils/constants';
import {resizeImageToTargetSize} from 'utils/image-compression';
import {ChangeEvent, Dispatch, SetStateAction} from 'react';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {ImagePicker} from 'components/ImagePicker';

interface Props {
  report: ServiceOrderReportView;
  attachments: ServiceOrderReportAttachmentView[];
  serviceCompanyId: string;
  serviceOrder: ServiceOrderView;
  isEditMode: boolean;
  setReport: Dispatch<SetStateAction<ServiceOrderReportView | undefined>>;
}

export const Pictures = ({
  report,
  attachments,
  serviceCompanyId,
  serviceOrder,
  isEditMode,
  setReport,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const {mutateAsync: uploadFiles} = useUploadFiles('');

  const onImageAdd = async (files: File[]) => {
    const {technicianId} = report!;
    const uploadPath = `${serviceCompanyId}/serviceOrders/${serviceOrder.id}/report/${technicianId}`;

    // Add temporary 'loading' state for the files
    const newAttachments = files.map((file, index) => ({
      id: serviceOrder.id,
      serviceOrderReportId: report.id,
      fileResource: {
        uri: 'loading',
        description: file.name,
        type: file.type,
        id: `${Date.now()}-${index}`, // Ensure a unique ID for sorting
        createdAt: Date.now().toString(),
      },
    }));

    // Preserve order: Add new attachments at the end
    const updatedAttachments = [
      ...(report?.attachments || []),
      ...newAttachments,
    ];

    setReport((prevReport) => ({
      ...prevReport!,
      attachments: updatedAttachments,
    }));

    try {
      // Resize the images if needed before uploading (optional)
      const resizedFiles = await Promise.all(
        files.map((file) => resizeImageToTargetSize(file, IMAGE_SIZE_IN_MB)),
      );

      // Upload the resized files
      await uploadFiles({files: resizedFiles, uploadPath});

      // Create final URIs for the uploaded files
      const uploadedAttachments = resizedFiles.map((file) => ({
        id: serviceOrder.id,
        serviceOrderReportId: report.id,
        fileResource: {
          uri: `${uploadPath}/${file.name}`,
          description: file.name,
          type: file.type,
          id: `${Date.now()}-${file.name}`, // Match the unique ID
          createdAt: Date.now().toString(),
        },
      }));

      // Replace 'loading' URIs with final URIs, maintaining the order
      setReport((prevReport) => ({
        ...prevReport!,
        attachments: prevReport!.attachments.map((attachment) =>
          attachment.fileResource.uri === 'loading'
            ? uploadedAttachments.find(
                (uploaded) =>
                  uploaded.fileResource.description ===
                  attachment.fileResource.description,
              ) || attachment
            : attachment,
        ),
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const onImageDelete = (image: {uri: string}) => {
    const updatedAttachments = report?.attachments.filter(
      (attachment) => attachment.fileResource.uri !== image.uri,
    );

    setReport((prevReport) => ({
      ...prevReport!,
      attachments: updatedAttachments!,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onImageAdd) {
      onImageAdd(Array.from(e.target.files));
    }
  };

  const isEmpty = !attachments || attachments.length === 0;

  const renderEmptySection = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
      <EmptySection
        label="No picture has been added yet!"
        illustration="clipboard"
        size="tiny"
        containerStyle={{
          height: '100%',
        }}
      />
    </Box>
  );

  return (
    <InfoCard
      containerStyles={{
        [theme.breakpoints.up('md')]: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      bodyContainerStyle={{
        [theme.breakpoints.up('lg')]: {
          height: '100%',
          overflowY: 'hidden',

          '&:hover': {
            overflowY: 'auto',
            ...olStyles.verticlaScrollBar,
          },
        },
        [theme.breakpoints.down('md')]: {
          height: '100%',
          overflowY: 'auto',
        },
      }}
      showHeaderBackground
      header={<Typography variant="subtitle1">{t('Pictures')}</Typography>}
      headerActionIcon={
        isEditMode ? <ImagePicker onChange={handleFileChange} /> : undefined
      }>
      {isEmpty ? (
        renderEmptySection()
      ) : (
        <HorizontalWorkReportImageList
          pictures={
            report.attachments.map((attachment) => ({
              description: attachment.fileResource.description,
              type: attachment.fileResource.type,
              uri: attachment.fileResource.uri,
            })) ?? []
          }
          serviceCompanyId={serviceCompanyId}
          isEditing={isEditMode}
          onImageDelete={onImageDelete}
        />
      )}
    </InfoCard>
  );
};
