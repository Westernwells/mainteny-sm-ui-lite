import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import {FileWithPreview, MyDropZone} from 'components/MyDropzone';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUploadImages} from 'hooks/reactQuery/useUploadSignedUrl';
import {Elevator, ElevatorRequestBody} from 'models/elevator';
import {useState} from 'react';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {FileResourceRecord} from 'models/media';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

interface Props {
  elevator: Elevator;
  elevatorRequestBody?: Partial<ElevatorRequestBody>;
  containerStyles?: {[key: string]: any};
}

export const Pictures = ({
  elevator,
  elevatorRequestBody,
  containerStyles,
}: Props) => {
  const [openDialog, setOpenDialog] = useState(false);
  const theme = useTheme();
  const {user} = useUserSession();
  const [acceptedFiles, setAcceptedFiles] = useState<FileWithPreview[]>([]);
  const {mutateAsync: uploadImages, isLoading} = useUploadImages(
    'Image uploaded successfully',
  );
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Elevator updated successfully',
  );
  const {data: downloadUrls = {}} = useDownloadUrl(
    elevator.additionalInfo.pictures.map((item) => item.uri),
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
              description: '',
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

  return (
    <InfoCard
      containerStyles={containerStyles}
      headerActionIcon={<Typography color="info.main">+Add</Typography>}
      handleAction={() => setOpenDialog(true)}
      bodyContainerStyle={{overflowX: 'scroll'}}
      showHeaderBackground
      header={<Typography variant="subtitle1">Pictures</Typography>}>
      <Grid container spacing={2} sx={{}}>
        {elevator.additionalInfo.pictures.map((item) => (
          <Grid
            item
            sm={4}
            sx={{
              border: `1px solid ${theme.palette.text.disabled}`,
              padding: '0.5em',
              height: '100%',
            }}>
            <img
              alt=""
              width="100%"
              height={120}
              src={downloadUrls[item.uri]}
              style={{
                objectFit: 'cover',
              }}
            />
            <Typography component="div">{item.description}</Typography>
          </Grid>
        ))}
      </Grid>

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
          getRejectedFileWithErrors={(file) => {
            console.log(file);
          }}
        />
      </Dialog>
    </InfoCard>
  );
};
