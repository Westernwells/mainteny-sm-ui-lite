import {ImageOutlined} from '@mui/icons-material';
import {Input, Avatar, IconButton, Grid2 as Grid} from '@mui/material';
import {Button} from 'components/Button';
import RichTextEditor from 'components/RichTextEditor';
import {t} from 'i18next';
import React from 'react';
import {Control, Controller} from 'react-hook-form';
import {theme} from 'theme';

type SignatureFormProps = {
  control: Control<any, any>;
  logoSrc: string;
  logoAltName: string;
  hiddenInputRef: React.RefObject<HTMLInputElement>;
  handleUploadedFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onUpload: () => void;
};

export const SignatureForm = ({
  control,
  logoSrc,
  logoAltName,
  hiddenInputRef,
  handleUploadedFile,
  onRemove,
  onUpload,
}: SignatureFormProps) => (
  <Grid container direction="row" spacing={2} alignItems="flex-start">
    <Grid
      container
      justifyContent="flex-start"
      alignItems="center"
      size={{xs: 1}}
      height="60px">
      <Grid sx={{position: 'relative', display: 'inline-block'}}>
        <Input
          type="file"
          sx={{display: 'none'}}
          inputRef={hiddenInputRef}
          inputProps={{accept: 'image/*'}}
          onChange={handleUploadedFile}
        />

        <Avatar src={logoSrc} sx={{width: 80, height: 80}} alt={logoAltName} />

        <IconButton
          onClick={onUpload}
          sx={{
            border: `1px solid ${theme.palette.secondary.mainLight}`,
            width: 32,
            height: 32,
            position: 'absolute',
            bottom: 0,
            right: 0,
            background: 'white',
            '&:hover': {
              background: theme.palette.grey[200],
            },
          }}>
          <ImageOutlined style={{width: 16, height: 16}} />
        </IconButton>
      </Grid>

      {logoSrc && (
        <Button
          buttonProps={{
            size: 'small',
            variant: 'outlined',
            onClick: onRemove,
            autoFocus: true,
            sx: {
              mr: 1,
              color: theme.palette.error.main,
              fontSize: '0.75rem',
              border: 'none',
            },
          }}>
          {t('Remove')}
        </Button>
      )}
    </Grid>

    <Grid size={{xs: 11}} flex="0 0 85%">
      <Controller
        name="text"
        control={control}
        render={({field}) => (
          <RichTextEditor
            label="Customize Signature"
            name="text"
            hasAttachFileButton={false}
            html={field.value || ''}
            updateHtml={field.onChange}
          />
        )}
      />
    </Grid>
  </Grid>
);
