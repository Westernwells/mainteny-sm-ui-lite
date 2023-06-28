import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {CheckCircleRounded} from '@mui/icons-material';
import {useEffect, useRef, useState} from 'react';
import {FileWithPath, useDropzone, FileRejection} from 'react-dropzone';
import useTheme from '@mui/material/styles/useTheme';
import {Cropper} from 'react-cropper';
import 'styles/cropper.css';

import {Dialog} from 'components/Dialog';
import {Button} from '../Button';
import {Thumb} from './Thumb';

export interface FileWithPreview extends FileWithPath {
  preview: string;
}
interface Props {
  existingFiles?: FileWithPreview[];
  getAcceptedFiles?: (val: FileWithPreview[]) => void;
  getRejectedFileWithErrors?: (val: FileRejection[]) => void;
  hint?: string;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  cropperTitle?: string;
  isCropped?: boolean;
}

type FileErrors = {
  type: boolean;
  size: boolean;
};

function formatAcceptedFileType(items: string[]) {
  const result: {[key: string]: any} = {};
  items.forEach((item) => {
    result[item] = [];
  });

  return result;
}

export const MyDropZone = ({
  existingFiles = [],
  getAcceptedFiles,
  getRejectedFileWithErrors,
  hint = '',
  acceptedFileTypes,
  maxFiles,
  isCropped = false,
  cropperTitle,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>(existingFiles);
  const [errors, setErrors] = useState<FileErrors>({type: false, size: true});
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [currentEditingFileName, setCurrentEditingFileName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const onKbinBytes = useRef(1000).current;
  const oneMbInByes = useRef(onKbinBytes * onKbinBytes).current;

  const [cropper, setCropper] = useState<any>();
  const {getRootProps, getInputProps, open, fileRejections} = useDropzone({
    maxSize: oneMbInByes * 5,
    maxFiles,
    accept: acceptedFileTypes
      ? formatAcceptedFileType(acceptedFileTypes)
      : {'*': []},
    onDrop: () => {
      setErrors({type: false, size: false});
      fileRejections.forEach((file) => {
        file.errors.forEach((err) => {
          if (err.code === 'file-too-large') {
            setErrors({...errors, size: true});
          }
          if (err.code === 'file-invalid-type') {
            setErrors({...errors, type: true});
          }
        });
      });
    },
    onDropAccepted: (acceptedFiles) => {
      if (maxFiles === 1) {
        setFiles([
          ...acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            }),
          ),
        ]);
      } else {
        setFiles([
          ...files,
          ...acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            }),
          ),
        ]);
      }
    },
  });

  const handleCropped = (croppFile?: null | File) => {
    if (getAcceptedFiles) {
      if (croppFile && croppFile !== null) {
        const result = [
          Object.assign(croppFile, {preview: URL.createObjectURL(croppFile!)}),
        ];
        getAcceptedFiles(result);
        return;
      }
      getAcceptedFiles(files);
    }
    if (getRejectedFileWithErrors) {
      getRejectedFileWithErrors(fileRejections);
    }
  };

  useEffect(() => {
    if (isCropped && files.length > 0) {
      setOpenDialog(true);
    }
    if (files.length > 0 && !isCropped) {
      handleCropped();
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

    setFiles(result);
  };

  const OnCancelEdit = () => {
    setIsEditingFileName(false);
    setNewFileName('');
  };

  const thumbs = files.map((file: FileWithPreview, index) => (
    <Thumb
      key={`${file.name}-${index}`}
      oneMbInByes={oneMbInByes}
      onKbinBytes={onKbinBytes}
      file={file}
      onNameChange={(e) => {
        setNewFileName(e.target.value);
      }}
      isEditingFileName={isEditingFileName}
      currentEditingFileName={currentEditingFileName}
      newFileName={newFileName}
      onDeleteFile={() => removeFile(`${file.name}_${index}`)}
      onCancelEdit={OnCancelEdit}
      onSaveFileName={() => {
        onSaveFileName(`${file.name}_${index}`);
        setIsEditingFileName(false);
      }}
      onEditClick={() => {
        setNewFileName(file.name);
        setIsEditingFileName(true);
        setCurrentEditingFileName(file.name);
      }}
    />
  ));

  const renderErrors = () =>
    fileRejections.map((item, index) => (
      <Box mb="0.5em" key={index}>
        <Typography component="div" variant="body1" color="error">
          {`${index + 1}. ${item.file.name}`}:{' '}
        </Typography>
        <Box sx={{ml: '1em'}}>
          {item.errors.map((error) => (
            <Typography
              component="div"
              variant="body2"
              color="error"
              key={index}>
              {error.code === 'file-too-large'
                ? t('File is larger than 5mb')
                : t(error.message)}
            </Typography>
          ))}
        </Box>
      </Box>
    ));

  function urlToFile(url: string, filename: string, mimeType: string) {
    return fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buf) => new File([buf], filename, {type: mimeType}));
  }
  const getCropData = async () => {
    let resultFile = null;
    if (typeof cropper !== 'undefined') {
      await urlToFile(
        cropper.getCroppedCanvas().toDataURL(),
        files[0].name,
        files[0].type,
      ).then((file) => {
        resultFile = file;
      });
    }
    return resultFile;
  };

  const saveCroppedFile = async () => {
    const croppedFile = await getCropData();
    handleCropped(croppedFile);
    setOpenDialog(false);
  };

  return (
    <Box
      className="container"
      component="section"
      width="100%"
      maxWidth="57rem">
      <Box
        component="div"
        {...getRootProps({className: 'dropzone'})}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.inputBackground.main,
          border: `2px dashed rgba(143, 155, 179, 0.5)`,
          p: '2rem',
          cursor: 'pointer',
          height: '10rem',
          borderRadius: '4px',
        }}>
        <input {...getInputProps()} />
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Button
            label={t('Select file to upload')}
            style={{textTransform: 'inherit'}}
            buttonProps={{
              variant: 'text',
              size: 'medium',
              color: 'primary',
              onClick: open,
            }}
          />
          <Typography variant="body2" component="div">
            {t('or drag and drop')}
          </Typography>
        </Box>
        <Typography variant="caption">
          {t(hint)} {t('(max. 5MB)')}
        </Typography>
      </Box>

      {!isCropped && (
        <Box sx={{mt: '1.5em'}}>
          {thumbs}
          <Box sx={{my: '0.625rem'}}>{renderErrors()}</Box>
        </Box>
      )}

      <Dialog
        title={cropperTitle || 'Upload image'}
        onCancel={() => setOpenDialog(false)}
        onSave={saveCroppedFile}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}>
        <Box>
          {files.length > 0 && (
            <>
              <Box
                sx={{
                  height: '2.5em',
                  width: '100%',
                  background: '#404040',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 0.625em',
                  color: 'white',
                  borderRadius: '4px 4px 0 0',
                }}>
                {t('Drag to reposition picture')}
              </Box>
              <Cropper
                style={{
                  height: 400,
                  width: '100%',
                }}
                zoomTo={1}
                initialAspectRatio={1}
                preview=".img-preview"
                src={files[0].preview}
                viewMode={1}
                minCropBoxHeight={10}
                minCropBoxWidth={10}
                background={false}
                responsive
                autoCropArea={1}
                checkOrientation={false}
                onInitialized={(instance) => {
                  setCropper(instance);
                }}
                guides
              />
            </>
          )}
          <Box
            sx={{mt: '1.5em'}}
            display="flex"
            justifyContent="space-between"
            alignItems="self-start">
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Box
                  sx={{
                    mr: '1em',
                    display: 'flex',
                    mt: '0.5em',
                    flexDirection: 'row',
                  }}>
                  <CheckCircleRounded
                    sx={{
                      mr: '0.5em',
                      color: errors.type ? 'error.main' : 'success.main',
                    }}
                  />
                  <Typography component="div" variant="body1">
                    {t('JPG, PNG or BMP only')}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    mr: '1em',
                    display: 'flex',
                    mt: '0.5em',
                    flexDirection: 'row',
                  }}>
                  <CheckCircleRounded
                    sx={{
                      mr: '0.5em',
                      color: errors.size ? 'error.main' : 'success.main',
                    }}
                  />
                  <Typography component="div" variant="body1">
                    {t('File size less than 5MB only')}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Button
              label={t('Replace Image')}
              buttonProps={{
                variant: 'text',
                onClick: open,
              }}
            />
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};
