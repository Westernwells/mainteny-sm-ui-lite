import React, {Dispatch, FC, SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import {olStyles} from 'styles';
import AddIcon from '@mui/icons-material/Add';
import {EmptySection} from 'components/EmptySection';
import {Dialog} from 'components/Dialog';
import {FileWithPreview, MyDropZone} from 'components/MyDropZone/MyDropzone';
import {FileResource} from 'models/media';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import DocumentIcon from '@mui/icons-material/AttachFile';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import ImageIcon from '@mui/icons-material/Image';
import {ReactComponent as DriveFileIcon} from 'assets/icons/DriveFileIcon.svg';
import {FormInput} from 'components/form/FormInput';
import {InfoCard} from 'components/InfoCard';
import {Tooltip} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import {useFormatDate} from 'hooks/useFormatDate';

interface Props {
  uploadedDocument?: FileResource[];
  setOpenDocumentDialog: Dispatch<SetStateAction<boolean>>;
  setDocuments: Dispatch<SetStateAction<FileWithPreview[]>>;
  downloadUrls?: {[key: string]: string};
  onRemoveDoc: (doc: any) => void;
  onDocsPreview: () => void;
  isUpdateLoading?: boolean;
  openDocumentDialog?: boolean;
  documents?: FileWithPreview[];
  updateContract: (obj: any) => void;
  contractId?: string;
}

export const AttachDocument: FC<Props> = ({
  uploadedDocument,
  setOpenDocumentDialog,
  downloadUrls,
  onRemoveDoc,
  onDocsPreview,
  isUpdateLoading,
  documents,
  openDocumentDialog,
  setDocuments,
  updateContract,
  contractId,
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [editingFileId, setEditingFileId] = useState('');
  const [fileName, setFileName] = useState('');
  const formatDate = useFormatDate();

  const handleFileNameChange = (fileId?: string) => {
    if (fileId) {
      const file = uploadedDocument?.find((d) => d.id === fileId);
      setFileName(file?.description ?? '');
      setEditingFileId(fileId);
    } else {
      setEditingFileId('');
      setFileName('');
    }
  };

  const onSaveFileName = async (fileId: string) => {
    const updatedDocuments = uploadedDocument?.map((d) =>
      d.id === fileId ? {...d, description: fileName} : d,
    );

    updateContract({
      body: {
        documents: updatedDocuments,
      },
      contractId,
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

  const isEmpty = !uploadedDocument || uploadedDocument.length === 0;

  return (
    <Grid item xs={12} md={8} lg={4} xl={4}>
      <InfoCard
        containerStyles={{
          [theme.breakpoints.up('md')]: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
          pt: 'unset',
        }}
        bodyContainerStyle={{
          [theme.breakpoints.up('md')]: {
            height: '9em',
            overflowY: 'hidden',
            overflowX: 'hidden',

            '&:hover': {
              overflowY: 'auto',
              overscrollBehaviorBlock: 'contain',
              ...olStyles.verticlaScrollBar,
            },
          },
          [theme.breakpoints.down('md')]: {
            height: '100%',
            overflowY: 'auto',
          },
        }}
        showHeaderBackground={false}
        header={
          <Box sx={{width: '100%'}}>
            <Typography
              variant="subtitle1"
              display="flex"
              alignItems="center"
              justifyContent="space-between">
              <Box
                display="flex"
                alignItems="center"
                gap="7px"
                sx={{fontWeight: 600}}>
                <DocumentIcon
                  width="1.5em"
                  height="1.5em"
                  sx={{color: theme.palette.text.secondary}}
                />
                {uploadedDocument?.length
                  ? t('Attached Documents')
                  : t('Documents')}
              </Box>
              <IconButton
                onClick={() => setOpenDocumentDialog(true)}
                edge="start"
                sx={{ml: '0.1rem'}}>
                <AddIcon
                  sx={{
                    fontSize: '2rem',
                    color: theme.palette.primary.main,
                  }}
                />
              </IconButton>
            </Typography>
            <Grid
              container
              sx={{
                flexBasis: '100%',
                borderBottom: `2px solid ${theme.palette.action.disabledBackground}`,
                mt: '0.5em',
                lineHeight: '38px',
              }}>
              <Grid
                item
                xs={6}
                sx={{color: theme.palette.text.secondary, fontSize: '14px'}}>
                {t('NAME')}
              </Grid>
              <Grid
                item
                xs={5}
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '14px',
                  display: 'flex',
                }}>
                {t('TYPE')}
              </Grid>
            </Grid>
          </Box>
        }>
        {isEmpty ? (
          renderEmptySection()
        ) : (
          <Box display="flex" flexDirection="column">
            {uploadedDocument?.map((document) => (
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
                    window.open(downloadUrls?.[document.uri], '_blank')
                  }>
                  {document?.type.startsWith('image/') ? (
                    <Avatar
                      alt={document.description}
                      src={downloadUrls?.[document.uri]}
                      sx={{
                        borderRadius: 0,
                        width: 56,
                        height: 56,
                      }}
                    />
                  ) : (
                    <FileCopyIcon
                      sx={{
                        fontSize: '3.5rem',
                        color: theme.palette.text.secondary,
                      }}
                    />
                  )}
                </Box>

                {editingFileId === document.id ? (
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={5} justifyContent="center" display="flex">
                      <Box display="flex" alignItems="center" maxWidth="160px">
                        <Box display="flex" flexDirection="column">
                          <FormInput
                            props={{
                              value: fileName,
                              size: 'small',
                              sx: {ml: '0.1rem'},
                              type: 'text',
                              onChange: (e) => setFileName(e.target.value),
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={5} alignSelf="center">
                      <Box display="flex" alignItems="center">
                        {document?.type.startsWith('image/') ? (
                          <ImageIcon
                            sx={{
                              backgroundColor: theme.palette.info.main,
                              color: theme.palette.primary.contrastText,
                              borderRadius: 1,
                              width: 17,
                              height: 17,
                            }}
                          />
                        ) : (
                          <DriveFileIcon />
                        )}

                        <Typography
                          variant="body1"
                          pl={1}
                          sx={{
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            color: document?.type.startsWith('image/')
                              ? theme.palette.info.main
                              : theme.palette.success.darkSuccess,
                          }}>
                          {document?.type.startsWith('image/')
                            ? t('Image')
                            : t('Document')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid
                      item
                      xs={2}
                      alignSelf="center"
                      display="flex"
                      justifyContent="center">
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
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container sx={{marginBottom: 2}}>
                    <Grid item xs={5}>
                      <Box display="flex" alignItems="center">
                        <Box display="flex" flexDirection="column">
                          <Tooltip
                            arrow
                            placement="top"
                            title={document.description}>
                            <Typography
                              variant="body1"
                              pl={2}
                              pr={1.75}
                              sx={{
                                maxWidth: '160px',
                                whiteSpace: 'wrap',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere',
                                fontWeight: 600,
                              }}>
                              {document.description}
                            </Typography>
                          </Tooltip>

                          <Typography
                            variant="body1"
                            pl={2}
                            pr={1.75}
                            sx={{
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              color: theme.palette.text.secondary,
                            }}>
                            {formatDate(document.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={5} alignSelf="center">
                      <Box display="flex" alignItems="center">
                        {document?.type.startsWith('image/') ? (
                          <ImageIcon
                            sx={{
                              backgroundColor: theme.palette.info.main,
                              color: theme.palette.primary.contrastText,
                              borderRadius: 1,
                              width: 17,
                              height: 17,
                            }}
                          />
                        ) : (
                          <DriveFileIcon />
                        )}

                        <Typography
                          variant="body1"
                          pl={1}
                          sx={{
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            color: document?.type.startsWith('image/')
                              ? theme.palette.info.main
                              : theme.palette.success.darkSuccess,
                          }}>
                          {document?.type.startsWith('image/')
                            ? t('Image')
                            : t('Document')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid
                      item
                      xs={2}
                      alignSelf="center"
                      display="flex"
                      justifyContent="center">
                      <IconButton
                        onClick={() => handleFileNameChange(document.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onRemoveDoc(document.id)}>
                        <DeleteOutline />
                      </IconButton>
                    </Grid>
                  </Grid>
                )}
              </Box>
            ))}
          </Box>
        )}

        <Dialog
          title="Add Documents"
          isSaving={isUpdateLoading}
          onCancel={() => setOpenDocumentDialog(false)}
          onSave={() => onDocsPreview()}
          disableSaveBtn={!documents?.length || isUpdateLoading}
          dialogProps={{
            maxWidth: 'md',
            open: openDocumentDialog || false,
          }}>
          <MyDropZone
            getAcceptedFiles={(dropedFiles) => {
              setDocuments(dropedFiles);
            }}
            acceptedFileTypes={[
              'application/pdf',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-excel',
              'text/tab-separated-values',
              'text/csv',
              'image/png',
              'image/jpeg',
              'image/jpg',
              'image/bmp',
              'image/gif',
              'image/webp',
              'image/svg+xml',
            ]}
          />
        </Dialog>
      </InfoCard>
    </Grid>
  );
};
