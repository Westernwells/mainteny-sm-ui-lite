import Input from '@mui/material/Input';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import {ReactComponent as AvatarIcon} from 'assets/icons/AvatarIcon.svg';
import {useEffect, useRef, useState} from 'react';
import {UseFormRegister, UseFormSetValue} from 'react-hook-form';
import {Button, IconButton, Typography} from '@mui/material';
import {theme} from 'theme';
import {useTranslation} from 'react-i18next';
import {ServiceCompanyContactPersonFormModel} from 'models/contacts';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';

interface Props {
  register: UseFormRegister<ServiceCompanyContactPersonFormModel>;
  setValue: UseFormSetValue<ServiceCompanyContactPersonFormModel>;
  imageUrl: string;
  readOnly?: boolean;
}

const ProfilePictureInput = ({
  register,
  setValue,
  imageUrl,
  readOnly = false,
}: Props) => {
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
    if (isFetched && imageUrl) {
      setPreview(downloadUrls[imageUrl]);
    } else {
      setPreview('');
    }
  }, [imageUrl, isFetched]);

  useEffect(() => {
    if (preview) {
      checkImageValidness(preview);
    }
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

        {!readOnly && (
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
        )}
      </Grid>
      {preview && isImageValid && !readOnly && (
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

interface ProfilePicturePreviewProps {
  imageUrl: string;
  contactPerson: {
    name: string;
    surname: string;
  };
}
export const ProfilePicturePreview = ({
  imageUrl,
  contactPerson,
}: ProfilePicturePreviewProps) => {
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

  const initials =
    `${contactPerson.name[0]}${contactPerson.surname[0]}`.toUpperCase();

  return (
    <Avatar
      src={isImageValid ? preview : ''}
      sx={{width: 56, height: 56, background: '#0F4C6414'}}>
      <Typography variant="h5" color="primary" lineHeight={1}>
        {initials}
      </Typography>
    </Avatar>
  );
};

export default ProfilePictureInput;
