import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {useTranslation} from 'react-i18next';
import {UseFormReturn} from 'react-hook-form';
import {
  ContactTitle,
  ServiceCompanyContactPeronFormModel,
  ServiceCompanyContactPersonRole,
} from 'models/contacts';
import {FormInput} from 'components/form/FormInput';
import {convertToText} from 'utils/utils';
import ProfilePictureInput from '../ProfilePictureInput';

interface Props {
  form: UseFormReturn<
    ServiceCompanyContactPeronFormModel,
    any,
    ServiceCompanyContactPeronFormModel
  >;
  initialValues?: ServiceCompanyContactPeronFormModel;
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
      <Grid item md={4}>
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
            {...register('userAccount.title')}>
            {titles.map((title: ContactTitle, index: number) => (
              <MenuItem value={title} key={index}>
                {t(title)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item md={4}>
        <FormInput
          props={{
            label: 'First name',
            required: true,
            ...register('userAccount.firstName', {required: true}),
          }}
        />
      </Grid>
      <Grid item md={4}>
        <FormInput
          props={{
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
          props={{
            label: 'Email',
            required: true,
            ...register('userAccount.contact.email', {required: true}),
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          props={{
            label: 'Company',
            ...register('contactPerson.companyName'),
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          props={{
            label: 'Phone',
            required: true,
            ...register('userAccount.contact.phone', {required: true}),
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          props={{
            label: 'Phone 2',
            ...register('contactPerson.secondaryPhone'),
          }}
        />
      </Grid>
    </Grid>
  );
};

export default Form;
