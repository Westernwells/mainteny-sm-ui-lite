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
  ServiceCompanyContactPersonOrderField,
  ServiceCompanyContactPersonRole,
  ServiceCompanyContactPersonView,
} from 'models/contacts';
import {FormInput} from 'components/form/FormInput';
import {convertToText} from 'utils/utils';
import AsyncSelect from 'components/AsyncSelect';
import {fetchServiceCompanyContactPersons} from 'hooks/reactQuery/useContacts';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Typography} from '@mui/material';
import ProfilePictureInput from '../../ProfilePictureInput';
import {Order} from '../../../../models/pagination';

interface Props {
  form: UseFormReturn<
    ServiceCompanyContactPersonFormModel,
    any,
    ServiceCompanyContactPersonFormModel
  >;
  initialValues?: ServiceCompanyContactPersonFormModel;
}

const titles = Object.values(ContactTitle);
const Form = ({form}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const serviceCompanyId = user!.userAccount.serviceCompany.id;

  const {
    register,
    watch,
    setValue,
    control,
    formState: {errors},
    reset,
  } = form;
  const isContactPersonSelected = !!watch('contactPerson.contactPersonId');

  return (
    <Grid container spacing={2} component="form">
      <Grid item md={12}>
        <ProfilePictureInput
          readOnly={isContactPersonSelected}
          register={register}
          setValue={setValue}
          imageUrl={
            isContactPersonSelected ? watch('userAccount.photoUrl') : ''
          }
        />
      </Grid>
      <Grid item md={3}>
        <FormControl fullWidth disabled={isContactPersonSelected}>
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
            value={watch('userAccount.title')}
            notched
            {...register('userAccount.title')}
            renderValue={() => watch('userAccount.title')}>
            {titles.map((title: ContactTitle, index: number) => (
              <MenuItem value={title} key={index}>
                {t(title)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item md={4.5}>
        <AsyncSelect<ServiceCompanyContactPersonView>
          freeSolo
          queryFn={(params) =>
            fetchServiceCompanyContactPersons(serviceCompanyId, {
              ...params,
              pageSize: 3,
              role: [...Object.values(ServiceCompanyContactPersonRole)],
              order: Order.DESC,
              orderBy: ServiceCompanyContactPersonOrderField.CREATED_DATE,
            })
          }
          keys={{label: 'userAccount.firstName', value: 'id'}}
          textFieldProps={{
            label: t('First name'),
            placeholder: t('Select customer'),
            error: !!errors.contactPerson?.contactPersonId,
            onChange: (e) => {
              setValue('userAccount.firstName', e.target.value);
            },
          }}
          renderOption={(props, option) => (
            <li
              {...props}
              key={option.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderBottom: '1px solid #EDF1F7',
                alignItems: 'flex-start',
              }}>
              <Typography>
                {`${option.userAccount.firstName} ${option.userAccount.lastName}` ||
                  '-'}
              </Typography>
              <Typography color="text.secondary">
                {option.companyName || '-'}
              </Typography>
            </li>
          )}
          name="contactPerson.contactPersonId"
          control={control}
          filterOptions={(options, state) => {
            const filteredOptions = options.filter((option) => {
              const firstName = option.userAccount.firstName.toLowerCase();
              const lastName = option.userAccount.lastName.toLowerCase();
              const searchText = state.inputValue.toLowerCase();
              return (
                firstName.includes(searchText) || lastName.includes(searchText)
              );
            });
            return filteredOptions;
          }}
          onChange={(e, value, reason) => {
            if (reason === 'clear') {
              reset();
            } else {
              const option = value as ServiceCompanyContactPersonView;
              setValue('userAccount.title', option?.userAccount?.title);
              setValue('userAccount.firstName', option?.userAccount?.firstName);
              setValue('userAccount.lastName', option?.userAccount?.lastName);
              setValue(
                'userAccount.contact.email',
                option?.userAccount?.contact.email,
              );
              setValue(
                'userAccount.contact.phone',
                option?.userAccount?.contact?.phone,
              );
              setValue(
                'contactPerson.roles',
                option.userAccount
                  .roles as unknown as ServiceCompanyContactPersonRole[],
              );
              setValue('contactPerson.companyName', option?.companyName);
              setValue(
                'contactPerson.secondaryPhone',
                option?.additionalInfo.secondaryPhone,
              );
              setValue('userAccount.photoUrl', option?.userAccount?.photoUrl);
            }
          }}
        />
      </Grid>
      <Grid item md={4.5}>
        <FormInput
          fieldProps={{
            disabled: isContactPersonSelected,
            label: 'Last name',
            required: true,
            ...register('userAccount.lastName', {required: true}),
          }}
        />
      </Grid>
      {isContactPersonSelected ? (
        <Grid item md={12}>
          <FormInput
            fieldProps={{
              disabled: true,
              label: 'Role',
              required: true,
              value: t(convertToText(watch('contactPerson.roles')[0] || '')),
            }}
          />
        </Grid>
      ) : (
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
      )}
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            disabled: isContactPersonSelected,
            label: 'Email',
            ...register('userAccount.contact.email'),
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            disabled: isContactPersonSelected,
            label: 'Company',
            ...register('contactPerson.companyName'),
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            disabled: isContactPersonSelected,
            label: 'Phone',
            ...register('userAccount.contact.phone'),
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            disabled: isContactPersonSelected,
            label: 'Phone 2',
            ...register('contactPerson.secondaryPhone'),
          }}
        />
      </Grid>
    </Grid>
  );
};

export default Form;
