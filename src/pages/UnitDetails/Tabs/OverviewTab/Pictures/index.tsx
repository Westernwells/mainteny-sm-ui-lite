import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import MUIDialog from '@mui/material/Dialog';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import {FileWithPreview, MyDropZone} from 'components/MyDropZone/MyDropzone';
import {FormInput} from 'components/form/FormInput';
import {Carousel} from 'components/Carousel';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {ElevatorView} from 'models/elevator';
import {useState} from 'react';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {EmptySection} from 'components/EmptySection';
import {olStyles} from 'styles';

interface Props {
  elevator: ElevatorView;
  propertyOwnerId?: string;
}

export const Pictures = ({elevator, propertyOwnerId}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [editingFileId, setEditingFileId] = useState('');
  const [fileName, setFileName] = useState('');
  const theme = useTheme();
  const {user} = useUserSession();
  const [acceptedFiles, setAcceptedFiles] = useState<FileWithPreview[]>([]);

  const [activeStep, setActiveStep] = useState(0);

  const {mutateAsync: uploadImages, isLoading} = useUploadFiles(
    'Image uploaded successfully',
  );
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Elevator updated successfully',
  );
  const {data: downloadUrls = {}} = useDownloadUrl(
    elevator.additionalInfo.pictures
      ? elevator.additionalInfo?.pictures?.map((item) => item.uri)
      : [],
  );

  const isEmpty =
    !elevator.additionalInfo.pictures ||
    elevator.additionalInfo.pictures.length === 0;

  const onSave = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/elevators/${elevator.id}/images`;
    await uploadImages({files: acceptedFiles, uploadPath});

    const updatedPictures = elevator.additionalInfo.pictures
      ? [
          ...elevator.additionalInfo.pictures,
          ...acceptedFiles.map((item) => ({
            description: item.name.split('.')[0],
            type: item.type,
            uri: `${uploadPath}/${item.name}`,
          })),
        ]
      : [
          ...acceptedFiles.map((item) => ({
            description: item.name.split('.')[0],
            type: item.type,
            uri: `${uploadPath}/${item.name}`,
          })),
        ];

    await updateElevator({
      body: {
        propertyOwnerId,
        pictures: updatedPictures,
      },
      elevatorId: elevator.id,
    });

    setOpenDialog(false);
  };

  const onDeletePicture = async (id: string) => {
    const filteredPictures = elevator.additionalInfo.pictures.filter(
      (pic) => pic.id !== id,
    );
    await updateElevator({
      elevatorId: elevator.id,
      body: {
        propertyOwnerId,
        pictures: filteredPictures,
      },
    });
  };

  const handleFileNameChange = (fileId?: string) => {
    if (fileId) {
      const file = elevator.additionalInfo.pictures.find(
        (p) => p.id === fileId,
      );
      setFileName(file?.description ?? '');
      setEditingFileId(fileId);
    } else {
      setEditingFileId('');
      setFileName('');
    }
  };

  const onSaveFileName = async (fileId: string) => {
    const updatedPictures = elevator.additionalInfo?.pictures?.map((p) =>
      p.id === fileId ? {...p, description: fileName} : p,
    );
    await updateElevator({
      elevatorId: elevator.id,
      body: {
        propertyOwnerId,
        pictures: updatedPictures,
      },
    });
    handleFileNameChange();
  };

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
        [theme.breakpoints.up('md')]: {
          height: '12em',
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
      headerActionIcon={
        <Typography color="info.main">{`+ ${t('Add')}`}</Typography>
      }
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography variant="subtitle1">{t('Pictures')}</Typography>}>
      {isEmpty ? (
        renderEmptySection()
      ) : elevator.additionalInfo.pictures.length ? (
        <Box display="flex" flexDirection="column">
          {elevator.additionalInfo?.pictures?.map((picture, index) => (
            <Box
              key={picture.id}
              display="flex"
              alignItems="center"
              py="0.5rem">
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                border={`1px solid ${theme.palette.text.disabled}`}
                borderRadius={1}
                onClick={() => {
                  setOpenPreview(true);
                  setActiveStep(index);
                }}
                sx={{cursor: 'pointer'}}>
                <img
                  alt=""
                  width={72}
                  height="100%"
                  src={downloadUrls[picture.uri]}
                  style={{objectFit: 'cover'}}
                />
              </Box>

              {editingFileId === picture.id ? (
                <Box sx={{display: 'flex'}}>
                  <FormInput
                    props={{
                      value: fileName,
                      size: 'small',
                      sx: {ml: '0.1rem'},
                      type: 'text',
                      onChange: (e) => setFileName(e.target.value),
                    }}
                  />
                  <IconButton
                    onClick={() => onSaveFileName(picture.id)}
                    edge="start"
                    sx={{ml: '0.1rem'}}>
                    <CheckCircleRounded
                      sx={{
                        color: theme.palette.primary.main,
                        fontSize: '1.2rem',
                      }}
                    />
                  </IconButton>

                  <IconButton
                    onClick={() => handleFileNameChange()}
                    edge="start">
                    <CancelIcon
                      sx={{
                        color: theme.palette.primary.main,
                        fontSize: '1.2rem',
                      }}
                    />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <Box display="flex">
                    <Typography
                      variant="body1"
                      pl={2}
                      pr={1.75}
                      sx={{
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                      }}>
                      {picture.description}
                    </Typography>
                    <IconButton
                      onClick={() => handleFileNameChange(picture.id)}
                      edge="start">
                      <EditIcon sx={{mt: '-0.2rem', fontSize: '1rem'}} />
                    </IconButton>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => onDeletePicture(picture.id)}
                    sx={{ml: 'auto'}}>
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </Box>
          ))}
        </Box>
      ) : null}

      <Dialog
        title="Add Pictures"
        isSaving={isLoading}
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}>
        <MyDropZone
          acceptedFileTypes={[
            'image/png',
            'image/jpeg',
            'image/bmp',
            'image/gif',
            'image/webp',
            'image/svg+xml',
          ]}
          hint="JPEG, PNG, BMP, GIF, WEBP or SVG"
          getAcceptedFiles={(files) => {
            setAcceptedFiles(files);
          }}
        />
      </Dialog>
      <MUIDialog
        onClose={() => setOpenPreview(false)}
        open={openPreview}
        maxWidth="sm">
        <Carousel
          images={elevator?.additionalInfo?.pictures?.map((p) => ({
            label: p.description,
            imgPath: downloadUrls[p.uri],
          }))}
          onClose={() => setOpenPreview(false)}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
        />
      </MUIDialog>
    </InfoCard>
  );
};
