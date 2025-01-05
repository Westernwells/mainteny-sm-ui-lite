import {ImageOutlined, RemoveRedEye} from '@mui/icons-material';
import {
  Input,
  Avatar,
  IconButton,
  Typography,
  Grid2 as Grid,
} from '@mui/material';
import {Button} from 'components/Button';
import RichTextEditor from 'components/RichTextEditor';
import {t} from 'i18next';
import React from 'react';
import {Control, Controller} from 'react-hook-form';
import {theme} from 'theme';

type Props = {
  logoSrc: string;
  logoAltName: string;
  hiddenInputRef: React.RefObject<HTMLInputElement>;
  handleUploadedFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onUpload: () => void;
  control: Control<any, any>;
  handleSubmit: () => void;
  handleCancel: () => void;
  handlePreview: () => void;
  isCreatingSignature: boolean;
};

const NewSignatureForm = ({
  control,
  hiddenInputRef,
  handleUploadedFile,
  onRemove,
  onUpload,
  logoSrc,
  logoAltName,
  handleSubmit,
  handleCancel,
  handlePreview,
  isCreatingSignature,
}: Props) => (
  <Grid container direction="row" spacing={2} alignItems="flex-start">
    <Grid
      size={{xs: 1}}
      container
      justifyContent="flex-start"
      alignItems="center"
      height="60px">
      <Grid sx={{position: 'relative', display: 'inline-block'}}>
        <Input
          type="file"
          sx={{display: 'none'}}
          inputRef={hiddenInputRef}
          inputProps={{
            accept: 'image/jpeg,image/png,image/webp',
          }}
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

    <Grid size={{xs: 11}} justifyContent="flex-start">
      <form onSubmit={handleSubmit}>
        <Controller
          name="text"
          control={control}
          render={({field}) => {
            const isDisabled =
              field.value === '<p></p>' ||
              !field.value ||
              field.value.trim().length === 0 ||
              isCreatingSignature;

            return (
              <>
                <RichTextEditor
                  label="Customize Signature"
                  name="text"
                  hasAttachFileButton={false}
                  html={field.value || ''}
                  updateHtml={field.onChange}
                />

                <Grid
                  width="100%"
                  spacing={2}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  display="flex"
                  mt={2}>
                  <Grid>
                    <Button
                      buttonProps={{
                        size: 'large',
                        variant: 'outlined',
                        onClick: handleCancel,
                        autoFocus: true,
                        sx: {mr: 2},
                      }}>
                      <Typography variant="subtitle2">{t('Cancel')}</Typography>
                    </Button>
                  </Grid>

                  <Grid sx={{display: 'flex'}}>
                    <Grid>
                      <Button
                        buttonProps={{
                          size: 'large',
                          variant: 'outlined',
                          onClick: handlePreview,
                          autoFocus: true,
                          sx: {mr: 2},
                          startIcon: <RemoveRedEye />,
                        }}>
                        <Typography variant="subtitle2">
                          {t('Preview')}
                        </Typography>
                      </Button>
                    </Grid>

                    <Grid>
                      <Button
                        buttonProps={{
                          size: 'large',
                          variant: 'contained',
                          onClick: handleSubmit,
                          autoFocus: true,
                          disabled: isDisabled,
                        }}>
                        <Typography variant="subtitle2">
                          {t('Save Signature')}
                        </Typography>
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            );
          }}
        />
      </form>
    </Grid>
  </Grid>
);

export default NewSignatureForm;
