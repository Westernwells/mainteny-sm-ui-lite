import {TabContext, TabList, TabPanel} from '@mui/lab';
import {
  Tab,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid2 as Grid,
  Box,
  Input,
  Avatar,
  IconButton,
  Button,
} from '@mui/material';
import {FormInput} from 'components/form/FormInput';
import {t} from 'i18next';
import {useRef, useState} from 'react';
import {Controller, UseFormGetValues, UseFormSetValue} from 'react-hook-form';
import {theme} from 'theme';
import {CustomerGeneralInformationFormModel} from 'models/customer';
import {ImageOutlined} from '@mui/icons-material';
import {Priority} from 'models/misc';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {PropertyOwnerView} from 'models/propertyManager';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {EditGeneralAddress} from './EditGeneralAddress';

type Props = {
  customer: PropertyOwnerView;
  control: any;
  errors: any;
  setValue: UseFormSetValue<CustomerGeneralInformationFormModel>;
  watch: any;
  getValues: UseFormGetValues<CustomerGeneralInformationFormModel>;
};

const EditCustomerGeneralInformation = ({
  customer,
  control,
  errors,
  setValue,
  watch,
  getValues,
}: Props) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';

  const {data: logoUrl = {}} = useDownloadUrl(
    customer.additionalInfo?.customerImagePath
      ? [customer.additionalInfo?.customerImagePath]
      : [],
    undefined,
    serviceCompanyId,
  );

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(
    logoUrl[customer.additionalInfo?.customerImagePath!],
  );
  const [activeTab, setActiveTab] = useState('businessAddress');

  const handleUploadedFile = (event: any) => {
    const file = event.target.files[0];
    const urlImage = URL.createObjectURL(file);
    setPreview(urlImage);
    setValue('logoFile', file as FileWithPreview);
  };

  const onUpload = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.click();
    }
  };

  const onRemove = () => {
    setPreview('');
    setValue('customerImagePath', '');
    setValue('logoFile', null);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
    }
  };
  return (
    <Grid container spacing={3}>
      <Grid size={{xs: 12}}>
        <Grid
          container
          width="fit-content"
          justifyContent="center"
          direction="column"
          gap={0.5}>
          <Grid
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
              alt={watch('name')}
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

      <Grid size={{xs: 4}}>
        <Controller
          name="name"
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Name',
                required: true,
                ...field,
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{xs: 4}}>
        <Controller
          name="email"
          control={control}
          rules={{
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t('Please enter a valid email address'),
            },
          }}
          render={({field}) => (
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Email address',
                ...field,
                error: !!errors?.email,
                helperText: errors?.email?.message || '',
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{xs: 4}}>
        <Controller
          name="externalId"
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Customer ID',
                ...field,
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{xs: 12}}>
        <TabContext value={activeTab}>
          <Box sx={{borderBottom: 1, borderColor: 'divider', width: '60%'}}>
            <TabList
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.light,
                },
              }}>
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

          {['businessAddress', 'postalAddress'].map((address) => (
            <TabPanel key={address} value={address} sx={{px: 0}}>
              <EditGeneralAddress
                address={
                  address as
                    | 'businessAddress'
                    | 'postalAddress'
                    | 'billingAddress'
                }
                control={control}
                errors={errors}
                setValue={
                  setValue as unknown as UseFormSetValue<CustomerGeneralInformationFormModel>
                }
                watch={watch}
                getValues={getValues}
              />
            </TabPanel>
          ))}
        </TabContext>
      </Grid>

      <Grid size={{xs: 12}} py={0} my={-1}>
        <Typography variant="h6" color="primary.dark">
          {t('Phone numbers')}
        </Typography>
      </Grid>

      <Grid size={{xs: 6}}>
        <Controller
          name="phone"
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Phone',
                ...field,
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{xs: 6}}>
        <Controller
          name="secondaryPhoneNumber"
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                size: 'small',
                label: '2nd Phone',
                ...field,
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{xs: 12}} py={0} my={-1}>
        <Typography variant="h6" color="primary.dark">
          {t('Other')}
        </Typography>
      </Grid>

      <Grid size={{xs: 4}}>
        <Controller
          name="url"
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Website',
                ...field,
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{xs: 4}}>
        <Controller
          name="vatId"
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'VAT ID',
                ...field,
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{xs: 4}}>
        <Controller
          name="priority"
          control={control}
          render={({field}) => (
            <FormControl fullWidth>
              <InputLabel size="small" shrink variant="outlined">
                {t('Priority')}
              </InputLabel>
              <Select {...field} label={t('Priority')} size="small" notched>
                {Object.keys(Priority).map((priority) => (
                  <MenuItem value={priority} key={priority}>
                    {t(priority)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>
    </Grid>
  );
};

export default EditCustomerGeneralInformation;
