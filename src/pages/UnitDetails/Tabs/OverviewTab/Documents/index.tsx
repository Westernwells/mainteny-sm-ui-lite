import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import {FileWithPreview, MyDropZone} from 'components/MyDropZone/MyDropzone';
import {FormInput} from 'components/form/FormInput';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {ElevatorView} from 'models/elevator';
import {useState} from 'react';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {EmptySection} from 'components/EmptySection';
import {useTranslation} from 'react-i18next';
import {olStyles} from 'styles';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';

interface Props {
  elevator: ElevatorView;
  propertyOwnerId?: string;
}

export const Documents = ({elevator, propertyOwnerId}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFileId, setEditingFileId] = useState('');
  const [fileName, setFileName] = useState('');
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
      ? elevator.additionalInfo.documents.map((d) => d.uri)
      : [],
  );

  const onSave = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/elevators/${elevator.id}/documents`;
    await uploadFiles({files: acceptedFiles, uploadPath});

    await updateElevator({
      body: {
        propertyOwnerId,
        documents: [
          ...elevator.additionalInfo.documents,
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
    const filteredDocuments = elevator.additionalInfo.documents.filter(
      (doc) => doc.id !== id,
    );
    await updateElevator({
      elevatorId: elevator.id,
      body: {
        propertyOwnerId,
        documents: filteredDocuments,
      },
    });
  };

  const handleFileNameChange = (fileId?: string) => {
    if (fileId) {
      const file = elevator.additionalInfo.documents.find(
        (d) => d.id === fileId,
      );
      setFileName(file?.description ?? '');
      setEditingFileId(fileId);
    } else {
      setEditingFileId('');
      setFileName('');
    }
  };

  const onSaveFileName = async (fileId: string) => {
    const updatedDocuments = elevator.additionalInfo.documents.map((d) =>
      d.id === fileId ? {...d, description: fileName} : d,
    );
    await updateElevator({
      elevatorId: elevator.id,
      body: {
        propertyOwnerId,
        documents: updatedDocuments,
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
        <Box display="flex" flexDirection="column">
          {elevator.additionalInfo.documents &&
            elevator.additionalInfo.documents.map((document) => (
              <Box
                key={document.id}
                display="flex"
                alignItems="center"
                py="0.5rem">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border={`1px solid ${theme.palette.text.disabled}`}
                  borderRadius={1}
                  sx={{cursor: 'pointer'}}
                  onClick={() =>
                    window.open(downloadUrls[document.uri], '_blank')
                  }>
                  <FileCopyIcon
                    sx={{
                      fontSize: '3.5rem',
                      color: theme.palette.text.secondary,
                    }}
                  />
                </Box>

                {editingFileId === document.id ? (
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
                      onClick={() => onSaveFileName(document.id)}
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
                        {document.description}
                      </Typography>
                      <IconButton
                        onClick={() => handleFileNameChange(document.id)}
                        edge="start">
                        <EditIcon sx={{mt: '-0.2rem', fontSize: '1rem'}} />
                      </IconButton>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => onDeleteDocument(document.id)}
                      sx={{ml: 'auto'}}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            ))}
        </Box>
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
