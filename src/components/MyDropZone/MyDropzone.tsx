/* eslint-disable */
import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {useEffect, useRef, useState} from 'react';
import {FileWithPath, useDropzone, FileRejection} from 'react-dropzone';
import useTheme from '@mui/material/styles/useTheme';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import {CheckCircleRounded} from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import {Button} from '../Button';
import {FormInput} from '../form/FormInput';

export interface FileWithPreview extends FileWithPath {
  preview: string;
}
interface Props {
  existingFiles?: FileWithPreview[];
  getAcceptedFiles?: (val: FileWithPreview[]) => void;
  getRejectedFileWithErrors?: (val: FileRejection[]) => void;
  hints?: string[];
  acceptedFileTypes?: 'image/*' | 'application/pdf' | '*';
  maxFiles?: number;
}

export const MyDropZone = ({
  existingFiles = [],
  getAcceptedFiles,
  getRejectedFileWithErrors,
  hints = [],
  acceptedFileTypes = '*',
  maxFiles,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [files, setFiles] = useState<FileWithPreview[]>(existingFiles);
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [currentEditingFileName, setCurrentEditingFileName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const onKbinBytes = useRef(1000).current;
  const oneMbInByes = useRef(onKbinBytes * onKbinBytes).current;
  const {getRootProps, getInputProps, open, fileRejections} = useDropzone({
    maxSize: oneMbInByes * 5,
    accept: {
      [acceptedFileTypes]: [],
    },
    maxFiles,
    disabled: maxFiles ? files.length >= maxFiles : false,
    onDropAccepted: (acceptedFiles) => {
      setFiles([
        ...files,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
  });

  useEffect(() => {
    if (getAcceptedFiles) {
      console.log(files, '@@@!!!!!++++===>');
      getAcceptedFiles(files);
    }

    if (getRejectedFileWithErrors) {
      getRejectedFileWithErrors(fileRejections);
    }
  }, [files, fileRejections]);

  const removeFile = (fileKey: string) => {
    const newFiles = files.filter(
      (item, index) => `${item.name}_${index}` !== fileKey,
    );

    setFiles(newFiles);
  };

  useEffect(
    () =>
      // revoke the data uris to avoid memory leaks
      () =>
        files.forEach((file) => URL.revokeObjectURL(file.preview)),
    [],
  );

  const onSaveFileName = (fileKey: string) => {
    const result = files.map((item, index) => {
      console.log(item, '.,,.,,,,,,,,,');
      if (`${item.name}_${index}` === fileKey) {
        const newFile = new File([item], newFileName, {
          type: item.type,
        });
        return Object.assign(newFile, {
          preview: URL.createObjectURL(newFile),
        });
      }
      return item;
    });

    console.log(result, '~~~~~~~~~');

    setFiles(result);
  };

  const OnCancelEdit = () => {
    setIsEditingFileName(false);
    setNewFileName('');
  };

  const hintsLabel = hints?.map((hint, key) => (
    <Box
      key={key}
      sx={{mr: '1em', display: 'flex', mt: '0.5em', flexDirection: 'row'}}>
      <CheckCircleRounded sx={{mr: '0.5em'}} />
      <Typography component="div" variant="body1">
        {hint}
      </Typography>
    </Box>
  ));

  const thumbs = files.map((file: FileWithPreview, index) => (
    <Box key={index} sx={{mr: '1em', display: 'flex', mt: '0.3em'}}>
      {file.type.split('/')[0] === 'image' ? (
        <img alt="" width={80} height={80} src={file.preview} />
      ) : (
        <FileCopyIcon
          sx={{fontSize: '4rem', color: theme.palette.text.secondary}}
        />
      )}

      <Box
        sx={{
          mx: '1em',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Typography>{file.name}</Typography>
        <Typography>
          {file.size >= oneMbInByes
            ? `${(file.size / oneMbInByes).toFixed(2)} Mb`
            : `${(file.size / onKbinBytes).toFixed(2)} Kb`}
        </Typography>
      </Box>

      {isEditingFileName && file.name === currentEditingFileName ? (
        <>
          <FormInput
            props={{
              sx: {},
              value: newFileName,
              size: 'small',
              fullWidth: true,
              type: 'text',
              onChange: (e) => {
                setNewFileName(e.target.value);
              },
            }}
          />
          <IconButton
            onClick={() => {
              onSaveFileName(`${file.name}_${index}`),
                setIsEditingFileName(false);
            }}
            edge="start">
            <CheckCircleRounded sx={{mt: '-0.8em'}} />
          </IconButton>

          <IconButton onClick={OnCancelEdit} edge="start">
            <CancelIcon sx={{mt: '-0.8em'}} />
          </IconButton>
        </>
      ) : (
        <>
          <IconButton
            onClick={() => {
              setNewFileName(file.name);
              setIsEditingFileName(true);
              setCurrentEditingFileName(file.name);
            }}
            edge="start">
            <EditIcon sx={{mt: '-0.8em'}} />
          </IconButton>
          <IconButton
            onClick={() => removeFile(`${file.name}_${index}`)}
            edge="start">
            <DeleteIcon sx={{mt: '-0.8em'}} />
          </IconButton>
        </>
      )}
    </Box>
  ));

  const renderErrors = () =>
    fileRejections.map((item, index) => (
      <Box mb="0.5em">
        <Typography component="div" variant="body1" color="error">
          {`${index + 1}. ${item.file.name}`}:{' '}
        </Typography>
        <Box sx={{ml: '1em'}}>
          {item.errors.map((error) => (
            <Typography component="div" variant="body2" color="error">
              {error.code === 'file-too-large'
                ? 'File is larger than 5mb'
                : error.message}
            </Typography>
          ))}
        </Box>
      </Box>
    ));

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: theme.palette.inputBackground.main,
          border: `2px dashed rgba(143, 155, 179, 0.5)`,
          py: '2em',
        }}>
        <div {...getRootProps({className: 'dropzone'})}>
          <input {...getInputProps()} />
          <Typography variant="body2" component="div" sx={{mb: '1em'}}>
            {t('Drag &apos;n&apos; drop or')}
          </Typography>
          <Button
            label="Select file"
            buttonProps={{
              variant: 'outlined',
              disabled: maxFiles ? files.length >= maxFiles : false,
              onClick: open,
            }}
          />
        </div>
      </Box>

      <Box sx={{mt: '1.5em'}}>
        <Box sx={{display: 'flex', flexDirection: 'column'}}>{hintsLabel}</Box>
        <Box sx={{display: 'flex', flexWrap: 'wrap'}}>{thumbs}</Box>
        <Box>{renderErrors()}</Box>
      </Box>
    </Box>
  );
};
