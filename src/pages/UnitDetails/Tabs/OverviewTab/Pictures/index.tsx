import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import {FileWithPreview, MyDropZone} from 'components/MyDropZone/MyDropzone';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {ElevatorView} from 'models/elevator';
import {useState} from 'react';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {FileResource, FileResourceRecord} from 'models/media';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {EmptySection} from 'components/EmptySection';
import {olStyles} from 'styles';

interface Props {
  elevator: ElevatorView;
  propertyOwnerId?: string;
  elevatorPictures?: FileResource[];
}

export const Pictures = ({
  elevator,
  propertyOwnerId,
  elevatorPictures = [],
}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [show, setShow] = useState('');
  const theme = useTheme();
  const {user} = useUserSession();
  const [acceptedFiles, setAcceptedFiles] = useState<FileWithPreview[]>([]);
  const {mutateAsync: uploadImages, isLoading} = useUploadFiles(
    'Image uploaded successfully',
  );
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Elevator updated successfully',
  );
  const {data: downloadUrls = {}} = useDownloadUrl(
    elevator.additionalInfo.pictures
      ? elevator.additionalInfo.pictures.map((item) => item.uri)
      : [],
  );

  const isEmpty =
    !elevator.additionalInfo.pictures ||
    elevator.additionalInfo.pictures.length === 0;

  const onSave = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/elevators/${elevator.id}/images`;
    await uploadImages({files: acceptedFiles, uploadPath});

    await updateElevator({
      body: {
        propertyOwnerId,
        pictures: [
          ...(elevatorPictures as FileResourceRecord[]),
          ...acceptedFiles.map((item) => ({
            description: item.name.split('.')[0],
            type: item.type,
            uri: `${uploadPath}/${item.name}`,
          })),
        ],
      },
      elevatorId: elevator.id,
    });

    setOpenDialog(false);
  };

  const onDeletePicture = async (id: string) => {
    await updateElevator({
      elevatorId: elevator.id,
      body: {
        propertyOwnerId,
        pictures: elevatorPictures.filter((pic) => pic.id !== id),
      },
    });
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
      ) : (
        <Grid container spacing={1} sx={{mt: '0.5em'}}>
          {elevator.additionalInfo.pictures &&
            elevator.additionalInfo.pictures.map((item, index) => (
              <Grid
                item
                xs={6}
                sm={4}
                key={index}
                sx={{
                  height: 120,
                  [theme.breakpoints.down('md')]: {
                    height: 170,
                  },
                }}
                onMouseEnter={() => setShow(item.id)}
                onMouseLeave={() => setShow('')}>
                <Box
                  sx={{
                    border: `1px solid ${theme.palette.text.disabled}`,
                    height: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  <Box
                    sx={{
                      flexGrow: 1,
                      height: 0,
                      cursor: 'pointer',
                      position: 'relative',
                    }}>
                    {show === item.id && (
                      <IconButton
                        onClick={() => onDeletePicture(item.id)}
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          borderRadius: 0,
                          color: 'white',
                          backgroundColor: 'rgba(34, 43, 69, 0.42)',
                        }}
                        disableRipple>
                        <DeleteIcon />
                      </IconButton>
                    )}
                    <img
                      alt=""
                      src={downloadUrls[item.uri]}
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'top',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </Box>
                </Box>
                {item.description ? (
                  <Typography
                    component="div"
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      maxWidth: '100%',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      height: '20%',
                    }}>
                    {item.description}
                  </Typography>
                ) : null}
              </Grid>
            ))}
        </Grid>
      )}

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
    </InfoCard>
  );
};
