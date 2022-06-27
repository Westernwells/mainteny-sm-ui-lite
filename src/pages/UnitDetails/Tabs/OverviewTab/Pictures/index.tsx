import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import {FileWithPreview, MyDropZone} from 'components/MyDropzone';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {ElevatorView, ElevatorRequestBody} from 'models/elevator';
import {useState} from 'react';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {FileResourceRecord} from 'models/media';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {EmptySection} from 'components/EmptySection';

interface Props {
  elevator: ElevatorView;
  elevatorRequestBody?: Partial<ElevatorRequestBody>;
}

export const Pictures = ({elevator, elevatorRequestBody}: Props) => {
  const [openDialog, setOpenDialog] = useState(false);
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

  const onSave = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/elevators/${elevator.id}/images`;
    await uploadImages({files: acceptedFiles, uploadPath});
    if (elevatorRequestBody) {
      await updateElevator({
        body: {
          ...elevatorRequestBody,
          pictures: [
            ...(elevatorRequestBody.pictures as FileResourceRecord[]),
            ...acceptedFiles.map((item) => ({
              description: item.name.split('.')[0],
              type: item.type,
              uri: `${uploadPath}/${item.name}`,
            })),
          ],
        },
        elevatorId: elevator.id,
      });
    }

    setOpenDialog(false);
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
        label="No pictures have been created yet. Please click the button below to create one!"
        showActionBtn
        btnLabel="Add Pictures"
        btnAction={() => setOpenDialog(true)}
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
      bodyContainerStyle={{overflowY: 'scroll'}}
      headerActionIcon={<Typography color="info.main">+ Add</Typography>}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography variant="subtitle1">Pictures</Typography>}>
      {!elevator.additionalInfo.pictures ||
      elevator.additionalInfo.pictures.length === 0 ? (
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
                }}>
                <Box
                  sx={{
                    border: `1px solid ${theme.palette.text.disabled}`,
                    padding: '0.5em',
                    height: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  <Box
                    sx={{flexGrow: 1, height: 0, cursor: 'pointer'}}
                    onClick={() =>
                      window.open(downloadUrls[item.uri], '_blank')
                    }>
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
                    variant="caption"
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
          getAcceptedFiles={(files) => {
            setAcceptedFiles(files);
          }}
        />
      </Dialog>
    </InfoCard>
  );
};
