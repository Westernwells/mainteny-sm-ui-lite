import React, {FC, useState} from 'react';
import {Box, IconButton, Typography, useTheme} from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import AcceptIcon from '@mui/icons-material/CheckCircle';
import {useFormik} from 'formik';
import {FileWithPreview} from './MyDropzone';
import {FormInput} from './form/FormInput';

export interface FileEditProps {
  name: string;
}

interface Props {
  index: number;
  file: FileWithPreview;
  onKbinBytes: number;
  oneMbInByes: number;
  removeFile: (fileKey: string) => void;
  editFile: (file: FileWithPreview) => void;
}

const SelectedFile: FC<Props> = ({
  index,
  file,
  onKbinBytes,
  oneMbInByes,
  removeFile,
  editFile,
}) => {
  const theme = useTheme();

  const [isEdit, setEdit] = useState<boolean>(false);

  const formik = useFormik<FileEditProps>({
    initialValues: {
      name: file.name,
    },
    onSubmit: () => {},
    enableReinitialize: true,
  });

  const cancelEdit = () => setEdit(false);
  const applyEdit = () => {
    setEdit(false);
    (file as any).name = formik.values.name;
    editFile(file);
  };
  const startEdit = () => setEdit(true);

  return (
    <Box sx={{mr: '1em', display: 'flex', mt: '0.3em', alignItems: 'center'}}>
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
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          {!isEdit ? (
            <>
              <Typography>{file.name}</Typography>
              <IconButton onClick={startEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <>
              <FormInput
                props={{
                  value: formik.values.name,
                  onChange: formik.handleChange,
                  onBlur: formik.handleBlur,
                  name: 'name',
                }}
              />
              <IconButton onClick={applyEdit}>
                <AcceptIcon />
              </IconButton>
              <IconButton onClick={cancelEdit}>
                <CancelIcon />
              </IconButton>
            </>
          )}
        </Box>
        <Typography>
          {file.size >= oneMbInByes
            ? `${(file.size / oneMbInByes).toFixed(2)} Mb`
            : `${(file.size / onKbinBytes).toFixed(2)} Kb`}
        </Typography>
      </Box>

      <IconButton onClick={() => removeFile(`${file.path}_${index}`)}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export default SelectedFile;
