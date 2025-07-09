import {Box, IconButton, List, ListItem, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {useTheme} from '@mui/material/styles';
import {UploadFile, UploadStatus} from 'models/attachment';
import {useMemo} from 'react';
import {getIconByExtension} from 'utils/attachment';
import {useTranslation} from 'react-i18next';
import {ReactComponent as EllipseIcon} from 'assets/icons/Ellipse.svg';
import {ReactComponent as DownloadingOutlinedIcon} from 'assets/icons/DownloadingOutlined.svg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {Button} from 'components/Button';
import MuiButton from '@mui/material/Button';
import {FileWithPreview} from 'models/files';

type Props = {
  uploadFilesMap: Map<string, UploadFile>;
  onClose: () => void;
  onRetry: (file: FileWithPreview[], parentId?: string) => void;
};

const AttachmentUpload = ({uploadFilesMap, onClose, onRetry}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();

  const uploadFiles = useMemo(
    () => Array.from(uploadFilesMap.values()),
    [uploadFilesMap],
  );

  const isOpen = uploadFiles.length > 0;
  const totalFiles = uploadFiles.length;

  if (!isOpen) return;

  return (
    <Box
      sx={{
        margin: 0,
        position: 'absolute',
        bottom: 64,
        right: 24,
        top: 'auto',
        left: 'auto',
        padding: '20px',
        width: 362,
        maxHeight: 500,
        borderRadius: 2,
        boxShadow: theme.shadows[8],
        gap: theme.spacing(4),
        zIndex: 400,
        backgroundColor: theme.palette.background.paper,
      }}>
      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Typography variant="h6" sx={{fontWeight: 600}}>
            {t('Uploading files')}
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{color: theme.palette.text.secondary}}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Typography variant="body2" color="text.secondary">
            {totalFiles > 1
              ? t('{{numberOfFiles}} files to be uploaded', {
                  numberOfFiles: totalFiles,
                })
              : t('1 file to be uploaded')}
          </Typography>
        </Box>
      </Box>

      <List
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflow: 'auto',
          maxHeight: 300,
        }}>
        {uploadFiles.map((uploadFile) => {
          const isError = uploadFile.status === UploadStatus.ERROR;
          const isComplete = uploadFile.status === UploadStatus.COMPLETED;
          const isUploading = uploadFile.status === UploadStatus.UPLOADING;
          return (
            <ListItem
              key={uploadFile.id}
              sx={{
                display: 'flex',
                padding: 0,
                alignItems: 'center',
                gap: theme.spacing(0.75),
                height: '22px',
              }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  alignItems: 'center',

                  ...(isError && {
                    color: '#FC5555',
                  }),
                }}>
                {getIconByExtension({
                  name: uploadFile.file?.type || 'jpeg',
                  isFolder: false,
                })}
              </Box>

              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flexGrow: 1,

                  ...(isError && {
                    color: '#FC5555',
                  }),
                }}>
                {uploadFile.name}
              </Typography>
              {isError && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing(0.75),
                  }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#FC5555',
                      fontWeight: 400,
                    }}>
                    {t('Failed')}
                  </Typography>
                  <EllipseIcon
                    style={{display: 'flex', width: '4px', height: '4px'}}
                  />
                  <DownloadingOutlinedIcon
                    style={{display: 'flex', width: '20px', height: '20px'}}
                  />
                  <MuiButton
                    sx={{
                      display: 'flex',
                      padding: 0,
                      background: 'transparent',
                    }}
                    onClick={() =>
                      onRetry([uploadFile.file!], uploadFile.parentId)
                    }
                    disableRipple>
                    {t('Retry')}
                  </MuiButton>
                </Box>
              )}

              {isUploading && (
                <Typography
                  variant="caption"
                  sx={{color: theme.palette.primary.light}}>
                  {t('Uploading')}
                </Typography>
              )}

              {isComplete && (
                <CheckCircleIcon
                  sx={{display: 'flex', color: theme.palette.success.main}}
                />
              )}
            </ListItem>
          );
        })}
      </List>
      <Box sx={{display: 'flex'}}>
        <Button
          buttonProps={{
            onClick: onClose,
            size: 'medium',
          }}>
          <Typography variant="subtitle2" color="primary.dark">
            {t('Cancel')}
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default AttachmentUpload;
