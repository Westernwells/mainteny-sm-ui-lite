import {useRef, useState} from 'react';
import {t} from 'i18next';
import {FormikProps} from 'formik';
import {theme} from 'theme';
import {
  Grid,
  InputAdornment,
  Input,
  Avatar,
  IconButton,
  Button,
  Box,
  Tab,
} from '@mui/material';
import {TabContext, TabList, TabPanel} from '@mui/lab';
import {Phone, ImageOutlined} from '@mui/icons-material';
import {FormInput} from 'components/form/FormInput';
import {BasicInformationCompanyFormModel} from './model';
import {EditAddress} from './EditAddress';

interface Props {
  formik: FormikProps<BasicInformationCompanyFormModel>;
}

export const EditBasicInformation = ({formik}: Props) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(formik.values.logoUrl);
  const [tabValue, setTabValue] = useState('billingAddress');

  const handleUploadedFile = (event: any) => {
    const file = event.target.files[0];
    const urlImage = URL.createObjectURL(file);
    setPreview(urlImage);
    formik.setFieldValue('logoFile', file);
  };

  const onUpload = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.click();
    }
  };

  const onRemove = () => {
    setPreview('');
    formik.setFieldValue('logoUrl', '');
    formik.setFieldValue('logoFile', null);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
    }
  };

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Grid container component="form" spacing={3}>
      <Grid item xs={12}>
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
              name="logoFile"
              inputProps={{
                ref: hiddenInputRef,
                accept: 'image/*',
                onChange: handleUploadedFile,
              }}
            />

            <Avatar
              src={preview}
              sx={{width: 80, height: 80}}
              alt={formik.values.name}
            />

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
              <ImageOutlined style={{width: '16px', height: '16px'}} />
            </IconButton>
          </Grid>
          {preview && (
            <Button
              size="small"
              sx={{color: theme.palette.error.main, fontSize: '0.75rem'}}
              onClick={onRemove}>
              {t('Remove')}
            </Button>
          )}
        </Grid>
      </Grid>
      <Grid item xs={6}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. Cable xyz',
            label: 'Name',
            name: 'name',
            helperText: formik.touched.name && formik.errors.name,
            error: !!formik.errors.name && formik.touched.name,
            required: true,
            value: formik.values.name,
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. www.yourcompany.com',
            label: 'Website',
            name: 'url',
            value: formik.values.url,
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g johndoe@example.com',
            label: 'Email',
            name: 'email',
            required: true,
            helperText: formik.touched.email && formik.errors.email,
            error: !!formik.errors.email && formik.touched.email,
            value: formik.values.email,
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. +49 173 12345678',
            label: 'Phone',
            name: 'phone',
            helperText: formik.touched.phone && formik.errors.phone,
            error: !!formik.errors.phone && formik.touched.phone,
            value: formik.values.phone,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start"> + </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Phone />
                </InputAdornment>
              ),
            },
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TabContext value={tabValue}>
          <Box sx={{borderBottom: 1, borderColor: 'divider', width: '60%'}}>
            <TabList
              onChange={(_, value) => setTabValue(value)}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.light,
                },
              }}>
              <Tab
                label={t('Billing address')}
                value="billingAddress"
                sx={{textTransform: 'none', typography: 'subtitle1'}}
              />
              <Tab
                label={t('Business address')}
                value="businessAddress"
                sx={{textTransform: 'none', typography: 'subtitle1'}}
              />
              <Tab
                label={t('Postal address')}
                value="postalAddress"
                sx={{textTransform: 'none', typography: 'subtitle1'}}
              />
            </TabList>
          </Box>

          {['billingAddress', 'businessAddress', 'postalAddress'].map(
            (address) => (
              <TabPanel key={address} value={address} sx={{px: 0}}>
                <EditAddress
                  address={
                    address as
                      | 'billingAddress'
                      | 'businessAddress'
                      | 'postalAddress'
                  }
                  formik={formik}
                />
              </TabPanel>
            ),
          )}
        </TabContext>
      </Grid>
    </Grid>
  );
};
