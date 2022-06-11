import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useEffect, useRef, useState} from 'react';
import {FileWithPath, useDropzone, FileRejection} from 'react-dropzone';
import useTheme from '@mui/material/styles/useTheme';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {Button} from './Button';

export interface FileWithPreview extends FileWithPath {
  preview: string;
}
interface Props {
  getAcceptedFiles?: (val: FileWithPreview[]) => void;
  getRejectedFileWithErrors?: (val: FileRejection[]) => void;
  acceptedFileTypes?: 'image/*' | 'application/pdf' | '*';
}

export const MyDropZone = ({
  getAcceptedFiles,
  getRejectedFileWithErrors,
  acceptedFileTypes = '*',
}: Props) => {
  const theme = useTheme();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const onKbinBytes = useRef(1000).current;
  const oneMbInByes = useRef(onKbinBytes * onKbinBytes).current;
  const {getRootProps, getInputProps, open, fileRejections} = useDropzone({
    maxSize: oneMbInByes * 5,
    accept: {
      [acceptedFileTypes]: [],
    },
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
              onClick: open,
            }}
          />
        </div>
      </Box>

      <Box sx={{mt: '1.5em'}}>
        <Box sx={{display: 'flex', flexWrap: 'wrap'}}>{thumbs}</Box>
        <Box>{renderErrors()}</Box>
      </Box>
    </Box>
  );
};
