import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import {FileWithPreview, MyDropZone} from 'components/MyDropZone/MyDropzone';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {ElevatorView} from 'models/elevator';
import {useState} from 'react';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {FileResource, FileResourceRecord} from 'models/media';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {EmptySection} from 'components/EmptySection';
import {useTranslation} from 'react-i18next';
import {olStyles} from 'styles';

interface Props {
  elevator: ElevatorView;
  propertyOwnerId?: string;
  elevatorDocuments?: FileResource[];
}

export const Documents = ({
  elevator,
  propertyOwnerId,
  elevatorDocuments,
}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [show, setShow] = useState('');
  const theme = useTheme();
  const {user} = useUserSession();
  const [acceptedFiles, setAcceptedFiles] = useState<FileWithPreview[]>([]);
  const {mutateAsync: uploadFiles, isLoading} = useUploadFiles(
    'Documents uploaded successfully',
  );
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Elevator updated successfully',
  );

  const onSave = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/elevators/${elevator.id}/documents`;
    await uploadFiles({files: acceptedFiles, uploadPath});

    await updateElevator({
      body: {
        propertyOwnerId,
        documents: [
          ...(elevatorDocuments as FileResourceRecord[]),
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

  const onDeleteDocument = async (id: string) => {
    await updateElevator({
      elevatorId: elevator.id,
      body: {
        propertyOwnerId,
        documents: elevatorDocuments?.filter((doc) => doc.id !== id) ?? [],
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
        label="No document has been attached yet!"
        illustration="clipboard"
        size="tiny"
        containerStyle={{
          height: '100%',
        }}
      />
    </Box>
  );

  const isEmpty =
    !elevator.additionalInfo.documents ||
    elevator.additionalInfo.documents.length === 0;

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
      header={<Typography variant="subtitle1">{t('Documents')}</Typography>}>
      {isEmpty ? (
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
                key={item.id}
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}>
                    {show === item.id && (
                      <IconButton
                        onClick={() => onDeleteDocument(item.id)}
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
                    variant="subtitle2"
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
          acceptedFileTypes={[
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/tab-separated-values',
            'text/csv',
          ]}
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
