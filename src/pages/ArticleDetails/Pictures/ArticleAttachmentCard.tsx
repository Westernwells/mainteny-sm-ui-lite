import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import {InfoCard} from 'components/InfoCard';
import {ArticleView} from 'models/article';
import {FileResource} from 'models/media';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUpdateArticle} from 'hooks/reactQuery/useArticle';
import {
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CustomSortLabel, {sortByName} from 'components/CustomSortLabel';
import {ReactComponent as DriveFileIcon} from 'assets/icons/DriveFileIcon.svg';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ImageIcon from '@mui/icons-material/Image';
import {useFormatDate} from 'hooks/useFormatDate';
import {CheckCircleRounded} from '@mui/icons-material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {FormInput} from 'components/form/FormInput';
import {Carousel} from 'components/Carousel';
import MUIDialog from '@mui/material/Dialog';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {FileWithPreview, MyDropZone} from 'components/MyDropZone/MyDropzone';
import {Dialog} from 'components/Dialog';
import {NoItemSection} from '../NoItemSection';

const isPreviewableImage = (file: FileResource) => {
  if (!file || !file.type) return false;
  const type = file.type.toLowerCase();
  return (
    type.startsWith('image/') && !['image/tiff', 'image/tif'].includes(type)
  );
};

export const ArticleAttachmentCard = ({article}: {article: ArticleView}) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const {t} = useTranslation();
  const formatDate = useFormatDate();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [openPreview, setOpenPreview] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [editingFileId, setEditingFileId] = useState('');
  const [acceptedFiles, setAcceptedFiles] = useState<FileWithPreview[]>([]);
  const uploadedPicture = article?.additionalInfo?.pictures || [];

  const {mutateAsync: uploadFiles, isLoading: isUploadLoading} = useUploadFiles(
    'Documents uploaded successfully',
  );
  const {mutateAsync: updateArticle, isLoading: isArticleUpdating} =
    useUpdateArticle(t('Article updated successfully.'));

  const {data: pictureUrls = {}} = useDownloadUrl(
    article.additionalInfo?.pictures?.map((item: FileResource) => item.uri) ||
      [],
  );

  const isEmpty = !article.additionalInfo?.pictures?.length;

  const sortedFiles = useMemo(
    () =>
      [...(article.additionalInfo?.pictures || [])].sort((a, b) =>
        sortByName(sortOrder)(a.type, b.type),
      ),
    [article.additionalInfo?.pictures, sortOrder],
  );

  const images = useMemo(
    () =>
      (article.additionalInfo?.pictures || []).filter((file) =>
        isPreviewableImage(file),
      ),
    [article.additionalInfo?.pictures],
  );

  const handleFileNameChange = (fileId?: string) => {
    if (fileId) {
      const file = article.additionalInfo?.pictures?.find(
        (p) => p.id === fileId,
      );
      setFileName(file?.description ?? '');
      setEditingFileId(fileId);
    } else {
      setEditingFileId('');
      setFileName('');
    }
  };

  const onSaveFileName = async (fileId: string, fileTitle: string) => {
    const updatedPictures = uploadedPicture?.map((d) =>
      d.id === fileId ? {...d, description: fileTitle} : d,
    );
    await updateArticle({
      article: {pictures: updatedPictures},
      articleId: article.id,
    });
  };

  const handleSaveFileName = async (fileId: string) => {
    await onSaveFileName(fileId, fileName);
    handleFileNameChange();
  };

  const handlePreviewFile = (picture: FileResource) => {
    if (isPreviewableImage(picture)) {
      const index = images.indexOf(picture);
      setOpenPreview(true);
      setActiveStep(index);
    } else {
      window.open(pictureUrls[picture.uri], '_blank');
    }
  };

  const onSave = async (uploadedFiles: FileWithPreview[]) => {
    const uploadPath = `${article.serviceCompanyId}/articles/${article.id}/images`;
    await uploadFiles({files: uploadedFiles, uploadPath});
    const updatedPictures = [
      ...(article.additionalInfo?.pictures || []),
      ...uploadedFiles.map((item) => ({
        description: item.name.split('.')[0],
        type: item.type,
        uri: `${uploadPath}/${item.name}`,
      })),
    ];

    await updateArticle({
      article: {pictures: updatedPictures},
      articleId: article.id,
    });
  };

  const onRemovePicture = async (id: string) => {
    const picturesToSave = (uploadedPicture || []).filter((d) => d.id !== id);
    await updateArticle({
      article: {pictures: picturesToSave},
      articleId: article.id,
    });
  };

  const handleSave = async () => {
    await onSave(acceptedFiles);
    setOpenDialog(false);
    setAcceptedFiles([]);
  };

  return (
    <>
      <InfoCard
        containerStyles={{
          mb: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: '100%',
        }}
        headerActionIcon={<EditIcon />}
        handleAction={() => setOpenDialog(true)}
        showHeaderBackground
        bodyContainerStyle={{
          display: 'flex',
          justifyContent: 'center',
          height: '100%',
          padding: '0px',
          width: '100%',
        }}
        header={
          <Typography variant="subtitle1">{t('Attachments')}</Typography>
        }>
        {isEmpty ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center">
            <NoItemSection
              label={t(
                'No attachments yet. Please click the button below to add!',
              )}
              illustration="attachment"
              buttonLabel={t('Add Attachments')}
              action={() => setOpenDialog(true)}
            />
          </Box>
        ) : (
          <Box padding="16px" width="100%">
            <TableContainer
              component={Paper}
              sx={{overflowX: 'hidden', boxShadow: 'none', padding: 0}}>
              <Table aria-label="attachments-table">
                <TableHead
                  sx={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 5,
                  }}>
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
                      <Divider
                        sx={{
                          width: '300%',
                          marginLeft: '-150%',
                          borderColor: '#8F9BB380',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedFiles.map((file) => (
                    <TableRow
                      key={file.id}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {background: theme.palette.grey[100]},
                      }}
                      onClick={() => handlePreviewFile(file)}>
                      <TableCell
                        align="left"
                        width="55%"
                        sx={{paddingLeft: 0, paddingRight: 0, padding: 0.5}}>
                        <Grid container wrap="nowrap" alignItems="center">
                          <Grid
                            border={`1px solid ${theme.palette.text.disabled}`}
                            borderRadius={1}
                            sx={{
                              cursor: 'pointer',
                              marginRight: '1rem',
                              overflow: 'hidden',
                              width: 48,
                              height: 48,
                            }}>
                            {isPreviewableImage(file) ? (
                              <img
                                loading="lazy"
                                alt=""
                                width="48px"
                                height="48px"
                                src={pictureUrls[file.uri]}
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
                          {editingFileId === file.id ? (
                            <FormInput
                              fieldProps={{
                                value: fileName,
                                size: 'small',
                                sx: {ml: '0.1rem', mr: '0.5rem'},
                                type: 'text',
                                onClick: (e) => e.stopPropagation(),
                                onChange: (e) => {
                                  e.stopPropagation();
                                  setFileName(e.target.value);
                                },
                              }}
                            />
                          ) : (
                            <Grid container direction="column">
                              <Typography
                                variant="body1"
                                pl={1}
                                sx={{
                                  wordBreak: 'break-word',
                                  overflowWrap: 'anywhere',
                                }}>
                                {file.description}
                              </Typography>
                              <Typography
                                variant="helperText"
                                pl={1}
                                sx={{color: theme.palette.text.secondary}}>
                                {formatDate(
                                  new Date(file.createdAt),
                                  'dd.MM.yyyy',
                                )}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </TableCell>
                      <TableCell
                        align="right"
                        width="45%"
                        sx={{paddingLeft: 0, paddingRight: 0, padding: 0.5}}>
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
                          <Grid
                            container
                            wrap="nowrap"
                            alignItems="center"
                            width="fit-content">
                            {editingFileId === file.id ? (
                              <>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveFileName(file.id);
                                  }}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileNameChange();
                                  }}
                                  edge="start"
                                  sx={{padding: '4px'}}>
                                  <CancelIcon
                                    sx={{
                                      color: theme.palette.primary.main,
                                      fontSize: '1.2rem',
                                    }}
                                  />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileNameChange(file.id);
                                  }}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemovePicture(file.id);
                                  }}
                                  sx={{ml: 'auto'}}>
                                  <DeleteOutlineIcon
                                    sx={{
                                      color: '#8F9BB380',
                                      width: '1.5rem',
                                      height: '1.5rem',
                                    }}
                                  />
                                </IconButton>
                              </>
                            )}
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        <MUIDialog
          onClose={() => setOpenPreview(false)}
          open={openPreview}
          maxWidth="md"
          sx={{
            '& .MuiDialog-container > .MuiPaper-root': {
              minHeight: '50%',
              minWidth: '50%',
              '& > div:nth-of-type(2)': {
                overflowY: 'hidden',
              },
            },
          }}>
          <Carousel
            images={
              images.map((p) => ({
                label: p.description,
                imgPath: pictureUrls[p.uri],
              })) || []
            }
            onClose={() => setOpenPreview(false)}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        </MUIDialog>
      </InfoCard>

      {openDialog && (
        <Dialog
          title="Add Attachments"
          isSaving={isUploadLoading || isArticleUpdating}
          saveButtonText="Upload attachment"
          disableSaveBtn={!acceptedFiles.length}
          onCancel={() => {
            setOpenDialog(false);
            setAcceptedFiles([]);
          }}
          onSave={handleSave}
          dialogProps={{maxWidth: 'md', open: openDialog}}>
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
              'application/vnd.ms-outlook',
              'image/tiff',
            ]}
            hint="JPEG, PNG, BMP, GIF, TIFF, PDF, DOC, DOCX, TXT, MSG or SVG"
            getAcceptedFiles={(filesList) => {
              setAcceptedFiles(filesList);
            }}
          />
        </Dialog>
      )}
    </>
  );
};
