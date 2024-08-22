import {IconButton, Input} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import {FormEvent, useRef} from 'react';

interface Props {
  onChange?: (e: FormEvent<HTMLInputElement>) => void;
}

export const ImagePicker = ({onChange}: Props) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    hiddenInputRef.current?.click();
  };

  return (
    <>
      <IconButton onClick={openPicker} sx={{padding: 0.5}}>
        <AddPhotoAlternateIcon />
      </IconButton>
      <Input
        type="file"
        sx={{display: 'none'}}
        inputProps={{
          ref: hiddenInputRef,
          accept: 'image/*',
          onChange,
          multiple: true,
        }}
      />
    </>
  );
};
