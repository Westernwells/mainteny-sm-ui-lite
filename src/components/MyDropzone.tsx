import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useEffect, useRef, useState} from 'react';
import {FileWithPath, useDropzone, FileRejection} from 'react-dropzone';
import useTheme from '@mui/material/styles/useTheme';
import {CheckCircleRounded} from '@mui/icons-material';
import {Button} from './Button';
import SelectedFile from './SelectedFile';

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
  const theme = useTheme();
  const [files, setFiles] = useState<FileWithPreview[]>(existingFiles);
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
        ...acceptedFiles.map((file) => {
          let newFile = Object.assign(file, {
            preview: URL.createObjectURL(file),
          });

          newFile = Object.defineProperties(newFile, {
            name: {
              writable: true,
              value: file.name,
            },
          });

          return newFile;
        }),
      ]);
    },
  });

  const editFile = (file: FileWithPreview) => {
    setFiles((prev) =>
      prev.map((f) => (f.preview === file.preview ? file : f)),
    );
  };

  useEffect(() => {
    if (getAcceptedFiles) {
      getAcceptedFiles(files);
    }

    if (getRejectedFileWithErrors) {
      getRejectedFileWithErrors(fileRejections);
    }
  }, [files, fileRejections]);

  const removeFile = (fileKey: string) => {
    const newFiles = files.filter(
      (item, index) => `${item.path}_${index}` !== fileKey,
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

  useEffect(() => {}, []);

  // console.log(files, '#####');
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
    <SelectedFile
      file={file}
      index={index}
      onKbinBytes={onKbinBytes}
      oneMbInByes={oneMbInByes}
      removeFile={removeFile}
      key={index}
      editFile={editFile}
    />
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
            Drag &apos;n&apos; drop or
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
