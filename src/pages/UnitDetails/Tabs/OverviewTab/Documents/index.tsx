import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import {FileWithPreview, MyDropZone} from 'components/MyDropZone/MyDropzone';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {ElevatorView, ElevatorRequestBody} from 'models/elevator';
import {useState} from 'react';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {FileResourceRecord} from 'models/media';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {EmptySection} from 'components/EmptySection';
import {useTranslation} from 'react-i18next';

interface Props {
  elevator: ElevatorView;
  elevatorRequestBody?: Partial<ElevatorRequestBody>;
}

export const Documents = ({elevator, elevatorRequestBody}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const theme = useTheme();
  const {user} = useUserSession();
  const [acceptedFiles, setAcceptedFiles] = useState<FileWithPreview[]>([]);
  const {mutateAsync: uploadFiles, isLoading} = useUploadFiles(
    'Documents uploaded successfully',
  );
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Elevator updated successfully',
  );
  const {data: downloadUrls = {}} = useDownloadUrl(
    elevator.additionalInfo.documents
      ? elevator.additionalInfo.documents.map((item) => item.uri)
      : [],
  );

  const onSave = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/elevators/${elevator.id}/documents`;
    await uploadFiles({files: acceptedFiles, uploadPath});
    console.log(acceptedFiles, 'QQQQQQ!!!');
    if (elevatorRequestBody) {
      await updateElevator({
        body: {
          ...elevatorRequestBody,
          documents: [
            ...(elevatorRequestBody.documents as FileResourceRecord[]),
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
        label="No documents have been created yet. Please click the button below to create one!"
        showActionBtn
        btnLabel="Add Documents"
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
      headerActionIcon={
        <Typography color="info.main">{`+ ${t('Add')}`}</Typography>
      }
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography variant="subtitle1">{t('Documents')}</Typography>}>
      {!elevator.additionalInfo.documents ||
      elevator.additionalInfo.documents.length === 0 ? (
        renderEmptySection()
      ) : (
        <Grid
          container
          spacing={2}
          sx={{
            mt: '0.5em',
          }}>
          {elevator.additionalInfo.documents &&
            elevator.additionalInfo.documents.map((item) => (
              <Grid
                item
                sm={4}
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
                    sx={{
                      flexGrow: 1,
                      height: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() =>
                      window.open(downloadUrls[item.uri], '_blank')
                    }>
                    <FileCopyIcon
                      sx={{
                        fontSize: '3rem',
                        [theme.breakpoints.down('md')]: {
                          fontSize: '9rem',
                        },
                        color: theme.palette.text.secondary,
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
                    }}>
                    {item.description}
                  </Typography>
                ) : null}
              </Grid>
            ))}
        </Grid>
      )}

      <Dialog
        title="Add Documents"
        isSaving={isLoading}
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}>
        <MyDropZone
          getAcceptedFiles={(files) => {
            console.log(files, '%%%%%%%%');
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
