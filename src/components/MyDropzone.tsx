import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useEffect, useRef, useState} from 'react';
import {FileWithPath, useDropzone} from 'react-dropzone';
import useTheme from '@mui/material/styles/useTheme';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import {Button} from './Button';

export interface FileWithPreview extends FileWithPath {
  preview: string;
}

export interface FilesWithError extends FileWithPath {
  error: string;
}
interface Props {
  getAcceptedFiles?: (val: FileWithPreview[]) => void;
  getRejectedFileWithErrors?: (val: FilesWithError[]) => void;
}

export const MyDropZone = ({
  getAcceptedFiles,
  getRejectedFileWithErrors,
}: Props) => {
  const theme = useTheme();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [filesWithError, setFilesWithError] = useState<FilesWithError[]>([]);
  const onKbinBytes = useRef(1000).current;
  const oneMbInByes = useRef(onKbinBytes * onKbinBytes).current;
  const {getRootProps, getInputProps, open} = useDropzone({
    accept: {
      'image/*': [],
    },
    onDrop: (acceptedFiles) => {
      let filesError: FilesWithError[] = [];
      const filesToAccept = acceptedFiles.filter((item) => {
        if (item.size <= oneMbInByes * 5) {
          return true;
        }
        filesError = [
          ...filesWithError,
          {...item, error: 'Maximum file size exceeded'},
        ];
        return false;
      });
      setFilesWithError(filesError);
      setFiles([
        ...files,
        ...filesToAccept.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
  });

  useEffect(() => {
    if (getAcceptedFiles) {
      getAcceptedFiles(files);
    }

    if (getRejectedFileWithErrors) {
      getRejectedFileWithErrors(filesWithError);
    }
  }, [files, filesWithError]);

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

  const thumbs = files.map((file: FileWithPreview, index) => (
    <Box key={index} sx={{mr: '1em', display: 'flex', mt: '0.3em'}}>
      <img alt="" width={80} height={80} src={file.preview} />
      <Box
        sx={{
          mx: '1em',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Typography>{file.path}</Typography>
        <Typography>
          {file.size >= oneMbInByes
            ? `${(file.size / oneMbInByes).toFixed(2)} Mb`
            : `${(file.size / onKbinBytes).toFixed(2)} Kb`}
        </Typography>
      </Box>

      <IconButton
        onClick={() => removeFile(`${file.path}_${index}`)}
        edge="start">
        <CancelIcon sx={{mt: '-0.8em'}} />
      </IconButton>
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
              onClick: open,
            }}
          />
        </div>
      </Box>

      <Box sx={{mt: '1.5em'}}>
        <Box sx={{display: 'flex', flexWrap: 'wrap'}}>{thumbs}</Box>
      </Box>
    </Box>
  );
};
