import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import MUIDialog from '@mui/material/Dialog';
import useTheme from '@mui/material/styles/useTheme';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import IconButton from '@mui/material/IconButton';
import {FileWithPreview, MyDropZone} from 'components/MyDropZone/MyDropzone';
import {FormInput} from 'components/form/FormInput';
import {Carousel} from 'components/Carousel';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useMemo, useState} from 'react';
import {EmptySection} from 'components/EmptySection';
import {olStyles} from 'styles';
import {FileResource} from 'models/media';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {ReactComponent as DriveFileIcon} from 'assets/icons/DriveFileIcon.svg';
import ImageIcon from '@mui/icons-material/Image';
import Divider from '@mui/material/Divider';
import CustomSortLabel, {sortByName} from 'components/CustomSortLabel';

interface Props {
  files: FileResource[];
  isLoading: boolean;
  onSaveFileName: (fileId: string, fileName: string) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
  onSaveUploadedFiles: (files: FileWithPreview[]) => Promise<void>;
}

const AttachmentsCard = ({
  files,
  isLoading,
  onSaveFileName,
  onDeleteFile,
  onSaveUploadedFiles,
}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [editingFileId, setEditingFileId] = useState('');
  const [fileName, setFileName] = useState('');
  const theme = useTheme();
  const [acceptedFiles, setAcceptedFiles] = useState<FileWithPreview[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [activeStep, setActiveStep] = useState(0);

  const {data: downloadUrls = {}} = useDownloadUrl(
    files ? files?.map((item) => item.uri) : [],
  );

  const isEmpty = !files || files.length === 0;

  const sortedFiles = useMemo(
    () => files?.sort((a, b) => sortByName(sortOrder)(a.type, b.type)),
    [files, sortOrder],
  );

  const images = useMemo(
    () => files?.filter((file) => file.type.includes('image')),
    [files],
  );

  const handleFileNameChange = (fileId?: string) => {
    if (fileId) {
      const file = files.find((p) => p.id === fileId);
      setFileName(file?.description ?? '');
      setEditingFileId(fileId);
    } else {
      setEditingFileId('');
      setFileName('');
    }
  };

  const handleSaveFileName = async (fileId: string) => {
    await onSaveFileName(fileId, fileName);
    handleFileNameChange();
  };

  const handleSave = async () => {
    await onSaveUploadedFiles(acceptedFiles);
    setOpenDialog(false);
  };

  const handlePreviewFile = (picture: FileResource) => {
    if (images.includes(picture)) {
      const index = images.indexOf(picture);
      setOpenPreview(true);
      setActiveStep(index);
    } else {
      window.open(downloadUrls[picture.uri], '_blank');
    }
  };

  const renderEmptySection = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '90%',
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
          '& .MuiCardHeader-root': {
            marginBottom: 0.5,
          },
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
      headerActionIcon={<AddIcon style={{color: theme.palette.text.primary}} />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground={false}
      header={
        <Grid container wrap="nowrap" gap={0.5}>
          <AttachFileIcon
            style={{
              transform: 'rotate(45deg)',
              color: theme.palette.text.secondary,
            }}
          />
          <Typography variant="subtitle1" fontWeight={600}>
            {t('Attachments')}
          </Typography>
        </Grid>
      }>
      {isEmpty ? (
        renderEmptySection()
      ) : files.length ? (
        <Box display="flex" flexDirection="column">
          <TableContainer
            component={Paper}
            sx={{overflow: 'hidden', boxShadow: 'none'}}>
            <Table aria-label="simple table">
              <TableHead sx={{position: 'sticky', top: 0}}>
                <TableRow>
                  <TableCell
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      padding: 0,
                    }}>
                    {t('NAME')}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      padding: 0,
                    }}>
                    <CustomSortLabel
                      direction={sortOrder}
                      onSort={setSortOrder}>
                      {t('TYPE')}
                    </CustomSortLabel>
                  </TableCell>
                </TableRow>
                <Divider sx={{width: '200%', borderColor: '#8F9BB380'}} />
              </TableHead>

              <TableBody>
                {sortedFiles?.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell
                      align="left"
                      width="55%"
                      sx={{paddingLeft: 0, paddingRight: 0}}>
                      {/* Preview */}
                      <Grid container wrap="nowrap" alignItems="center">
                        <Grid
                          onClick={() => handlePreviewFile(file)}
                          border={`1px solid ${theme.palette.text.disabled}`}
                          borderRadius={1}
                          sx={{
                            cursor: 'pointer',
                            marginRight: '1rem',
                            overflow: 'hidden',
                            width: 48,
                            height: 48,
                            minWidth: 48,
                            minHeight: 48,
                          }}>
                          {images.includes(file) ? (
                            <img
                              loading="lazy"
                              alt=""
                              width="48px"
                              height="48px"
                              src={downloadUrls[file.uri]}
                              style={{objectFit: 'cover'}}
                            />
                          ) : (
                            <FileCopyIcon
                              style={{
                                color: theme.palette.text.secondary,
                                width: 48,
                                height: 48,
                              }}
                            />
                          )}
                        </Grid>

                        {/* Name */}
                        {editingFileId === file.id ? (
                          <FormInput
                            props={{
                              value: fileName,
                              size: 'small',
                              sx: {ml: '0.1rem', mr: '0.5rem'},
                              type: 'text',
                              onChange: (e) => setFileName(e.target.value),
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body1"
                            pl={2}
                            pr={1.75}
                            sx={{
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                            }}>
                            {file.description}
                          </Typography>
                        )}
                      </Grid>
                    </TableCell>

                    {/* Type */}
                    <TableCell
                      align="right"
                      width="45%"
                      sx={{paddingLeft: 0, paddingRight: 0}}>
                      <Grid
                        container
                        wrap="nowrap"
                        justifyContent="space-between">
                        <Grid container wrap="nowrap" alignItems="center">
                          {file?.type.startsWith('image/') ? (
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
                            <DriveFileIcon style={{width: 17, height: 17}} />
                          )}

                          <Typography
                            variant="body1"
                            pl={1}
                            sx={{
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              color: file?.type.startsWith('image/')
                                ? theme.palette.info.main
                                : theme.palette.success.darkSuccess,
                            }}>
                            {file?.type.startsWith('image/')
                              ? t('Image')
                              : t('Document')}
                          </Typography>
                        </Grid>

                        {/* Actions */}
                        {editingFileId === file.id ? (
                          <Grid
                            container
                            wrap="nowrap"
                            alignItems="center"
                            width="fit-content"
                            gap="1rem">
                            <IconButton
                              onClick={() => handleSaveFileName(file.id)}
                              edge="start"
                              sx={{ml: '0.1rem', padding: '4px'}}>
                              <CheckCircleRounded
                                sx={{
                                  color: theme.palette.primary.main,
                                  fontSize: '1.2rem',
                                }}
                              />
                            </IconButton>

                            <IconButton
                              onClick={() => handleFileNameChange()}
                              edge="start"
                              sx={{padding: '4px'}}>
                              <CancelIcon
                                sx={{
                                  color: theme.palette.primary.main,
                                  fontSize: '1.2rem',
                                }}
                              />
                            </IconButton>
                          </Grid>
                        ) : (
                          <Grid
                            container
                            wrap="nowrap"
                            alignItems="center"
                            width="fit-content">
                            <IconButton
                              onClick={() => handleFileNameChange(file.id)}
                              edge="start">
                              <EditOutlinedIcon
                                style={{
                                  color: '#8F9BB380',
                                  width: '1.5rem',
                                  height: '1.5rem',
                                }}
                              />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => onDeleteFile(file.id)}
                              sx={{ml: 'auto'}}>
                              <DeleteOutlineIcon
                                sx={{
                                  color: '#8F9BB380',
                                  width: '1.5rem',
                                  height: '1.5rem',
                                }}
                              />
                            </IconButton>
                          </Grid>
                        )}
                      </Grid>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : null}

      <Dialog
        title="Attachment upload"
        isSaving={isLoading}
        onCancel={() => {
          setOpenDialog(false);
          setAcceptedFiles([]);
        }}
        onSave={handleSave}
        saveButtonText="Upload attachment"
        disableSaveBtn={!acceptedFiles.length}
        dialogProps={{
          maxWidth: 'sm',
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
            'image/png',
            'image/jpeg',
            'image/bmp',
            'image/gif',
            'image/webp',
            'image/svg+xml',
          ]}
          hint="JPEG, PNG, BMP, GIF, PDF, DOC, DOCX, TXT or SVG"
          getAcceptedFiles={(filesList) => {
            setAcceptedFiles(filesList);
          }}
        />
      </Dialog>
      <MUIDialog
        onClose={() => setOpenPreview(false)}
        open={openPreview}
        maxWidth="md"
        sx={{
          '& .MuiDialog-container > .MuiPaper-root': {
            minWidth: '50%',
            minHeight: '50%',
            // removes scrolling of preview image
            '& > div:nth-of-type(2)': {
              overflowY: 'hidden',
            },
          },
        }}>
        <Carousel
          images={images?.map((p) => ({
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

export default AttachmentsCard;
