import Input from '@mui/material/Input';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import {ReactComponent as AvatarIcon} from 'assets/icons/AvatarIcon.svg';
import {useEffect, useRef, useState} from 'react';
import {UseFormRegister, UseFormSetValue} from 'react-hook-form';
import {Button, IconButton} from '@mui/material';
import {theme} from 'theme';
import {useTranslation} from 'react-i18next';
import {ServiceCompanyContactPeronFormModel} from 'models/contacts';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';

interface Props {
  register: UseFormRegister<ServiceCompanyContactPeronFormModel>;
  setValue: UseFormSetValue<ServiceCompanyContactPeronFormModel>;
  imageUrl: string;
}

const ProfilePictureInput = ({register, setValue, imageUrl}: Props) => {
  const {t} = useTranslation();
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const {data: downloadUrls = {}, isFetched} = useDownloadUrl(
    imageUrl !== '' ? [imageUrl] : [],
  );

  const [preview, setPreview] = useState('');
  const [isImageValid, setIsImageValid] = useState(false);

  const checkImageValidness = async (url: string) => {
    try {
      const response = await fetch(url, {method: 'GET'});
      setIsImageValid(response.status !== 403);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  useEffect(() => {
    if (isFetched) {
      setPreview(downloadUrls[imageUrl]);
    }
  }, [imageUrl, isFetched]);

  useEffect(() => {
    checkImageValidness(preview);
  }, [preview]);

  const handleUploadedFile = (event: any) => {
    const file = event.target.files[0];

    const urlImage = URL.createObjectURL(file);

    setPreview(urlImage);
  };

  const onUpload = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.click();
    }
  };

  const onRemove = () => {
    setPreview('');
    setValue('userAccount.photoUrl', '');
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
    }
  };

  return (
    <Grid
      container
      width="fit-content"
      justifyContent="center"
      direction="column"
      gap={0.5}>
      <Grid
        item
        sx={{
          position: 'relative',
          width: 'fit-content',
        }}>
        <Input
          type="file"
          sx={{display: 'none'}}
          {...register('userAccount.photoUrl')}
          inputProps={{
            ref: hiddenInputRef,
            accept: 'image/*',
            onChange: handleUploadedFile,
          }}
        />

        <Avatar
          src={isImageValid ? preview : ''}
          sx={{width: 80, height: 80, background: '#0F4C6414'}}>
          <AvatarIcon width="75%" height="100%" />
        </Avatar>

        <IconButton
          onClick={onUpload}
          sx={{
            border: `1px solid ${theme.palette.secondary.mainLight}`,
            width: '32px',
            height: '32px',
            position: 'absolute',
            bottom: '0',
            right: '0',
            background: 'white',
            '&:hover': {
              background: theme.palette.grey[200],
            },
          }}>
          <CameraAltIcon style={{width: '16px', height: '16px'}} />
        </IconButton>
      </Grid>
      {preview && isImageValid && (
        <Button
          size="small"
          sx={{color: theme.palette.error.main, fontSize: '0.75rem'}}
          onClick={onRemove}>
          {t('Remove')}
        </Button>
      )}
    </Grid>
  );
};

export default ProfilePictureInput;
