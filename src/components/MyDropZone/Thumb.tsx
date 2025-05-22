import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ChangeEvent} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {CheckCircleRounded} from '@mui/icons-material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Grid from '@mui/material/Grid';
import {Tooltip} from '@mui/material';
import {FormInput} from '../form/FormInput';
import {FileWithPreview} from './MyDropzone';

interface Props {
  oneMbInByes: number;
  onKbinBytes: number;
  file: FileWithPreview;
  onNameChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  isEditingFileName: boolean;
  currentEditingFileName: string;
  newFileName: string;
  onDeleteFile: () => void;
  onCancelEdit: () => void;
  onSaveFileName: () => void;
  onEditClick: () => void;
}

export const Thumb = ({
  oneMbInByes,
  onKbinBytes,
  file,
  onNameChange,
  isEditingFileName,
  currentEditingFileName,
  newFileName,
  onCancelEdit,
  onSaveFileName,
  onEditClick,
  onDeleteFile,
}: Props) => {
  const theme = useTheme();

  const isSupportedImage = (type: string) => {
    const supportedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
    ];
    return supportedTypes.includes(type.toLowerCase());
  };

  const isVideo = file.type === 'video/mp4';

  return (
    <Box
      sx={{
        display: 'flex',
        py: '0.5rem',
        justifyContent: 'space-between',
      }}>
      <Grid container wrap="nowrap">
        {isSupportedImage(file.type) ? (
          <img
            alt=""
            width={36}
            height={46}
            src={file.preview}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : isVideo ? (
          <>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={file.preview}
              controls
              width={36}
              height={46}
              style={{objectFit: 'cover'}}
            />
          </>
        ) : (
          <FileCopyIcon
            sx={{fontSize: '3rem', color: theme.palette.text.secondary}}
          />
        )}

        <Box
          sx={{
            mx: '1em',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '50%',
          }}>
          {isEditingFileName && file.name === currentEditingFileName ? (
            <Box sx={{display: 'flex'}}>
              <FormInput
                fieldProps={{
                  value: newFileName,
                  size: 'small',
                  fullWidth: true,
                  type: 'text',
                  onChange: onNameChange,
                }}
              />
            </Box>
          ) : (
            <Tooltip title={file.name}>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 200,
                }}>
                {file.name}
              </Typography>
            </Tooltip>
          )}

          <Typography variant="caption" color="text.secondary">
            {file.size >= oneMbInByes
              ? `${(file.size / oneMbInByes).toFixed(2)} MB`
              : `${(file.size / onKbinBytes).toFixed(2)} KB`}
          </Typography>
        </Box>
      </Grid>

      <Grid container wrap="nowrap" width="fit-content">
        {isEditingFileName && file.name === currentEditingFileName ? (
          <>
            <IconButton onClick={onSaveFileName} sx={{height: 'fit-content'}}>
              <CheckCircleRounded sx={{color: theme.palette.primary.main}} />
            </IconButton>

            <IconButton onClick={onCancelEdit} sx={{height: 'fit-content'}}>
              <CancelIcon sx={{color: theme.palette.primary.main}} />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton onClick={onEditClick} sx={{height: 'fit-content'}}>
              <EditOutlinedIcon
                sx={{
                  color: '#8F9BB380',
                  width: '1.5rem',
                  height: '1.5rem',
                }}
              />
            </IconButton>
            <IconButton onClick={onDeleteFile} sx={{height: 'fit-content'}}>
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
    </Box>
  );
};
