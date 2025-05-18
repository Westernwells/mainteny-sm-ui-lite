import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {useTranslation} from 'react-i18next';
import {UseFormReturn} from 'react-hook-form';
import {
  ContactTitle,
  ServiceCompanyContactPersonFormModel,
  ServiceCompanyContactPersonRole,
} from 'models/contacts';
import {FormInput} from 'components/form/FormInput';
import {convertToText} from 'utils/utils';
import ProfilePictureInput from '../ProfilePictureInput';

interface Props {
  form: UseFormReturn<
    ServiceCompanyContactPersonFormModel,
    any,
    ServiceCompanyContactPersonFormModel
  >;
  initialValues?: ServiceCompanyContactPersonFormModel;
}

const titles = Object.values(ContactTitle);
const Form = ({form, initialValues}: Props) => {
  const {t} = useTranslation();
  const {register, watch, setValue} = form;

  return (
    <Grid container spacing={2} component="form">
      <Grid item md={12}>
        <ProfilePictureInput
          register={register}
          setValue={setValue}
          imageUrl={initialValues?.userAccount.photoUrl || ''}
        />
      </Grid>
      <Grid item md={3}>
        <FormControl fullWidth>
          <InputLabel
            size="small"
            shrink
            variant="outlined"
            id="demo-simple-select-label">
            {t('Title')}
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            label={t('Title')}
            size="small"
            defaultValue={watch('userAccount.title')}
            notched
            {...register('userAccount.title')}
            renderValue={(selected) => t(selected as string)}>
            {titles.map((title: ContactTitle, index: number) => (
              <MenuItem value={title} key={index}>
                {t(title)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item md={4.5}>
        <FormInput
          fieldProps={{
            label: 'First name',
            ...register('userAccount.firstName'),
          }}
        />
      </Grid>
      <Grid item md={4.5}>
        <FormInput
          fieldProps={{
            label: 'Last name',
            required: true,
            ...register('userAccount.lastName', {required: true}),
          }}
        />
      </Grid>
      <Grid item md={12}>
        <FormControl fullWidth required>
          <InputLabel
            size="small"
            shrink
            variant="outlined"
            id="demo-simple-select-label">
            {t('Role')}
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            label={t('Role')}
            size="small"
            defaultValue={watch('contactPerson.roles')}
            required
            notched
            {...register('contactPerson.roles', {required: true})}>
            {Object.values(ServiceCompanyContactPersonRole).map(
              (role, index) => (
                <MenuItem value={role} key={index}>
                  {t(convertToText(role))}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
      </Grid>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            label: 'Email',
            ...register('userAccount.contact.email'),
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            label: 'Company',
            ...register('contactPerson.companyName'),
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            label: 'Phone',
            ...register('userAccount.contact.phone'),
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            label: 'Phone 2',
            ...register('contactPerson.secondaryPhone'),
          }}
        />
      </Grid>
    </Grid>
  );
};

export default Form;
