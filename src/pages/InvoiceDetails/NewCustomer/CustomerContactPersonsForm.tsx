import {FormikProps} from 'formik';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import {EmptySection} from 'components/EmptySection';
import {Button} from 'components/Button';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  CustomerContactPersonsFormModel,
  PropertyContactPersonRole,
} from '../../NewCustomer/model';
import {EditContactForm} from './EditContactForm';

interface Props {
  formik: FormikProps<CustomerContactPersonsFormModel>;
}

export const CustomerContactPersonsForm = ({formik}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();

  const deleteContact = (index: number) => {
    const updatedContactPersons = formik.values.contactPersons.filter(
      (_item, idx) => idx !== index,
    );
    formik.setValues({
      contactPersons: updatedContactPersons,
    });
  };

  const addEmptyContactPerson = () => {
    formik.setValues({
      contactPersons: [
        ...formik.values.contactPersons,
        {
          propertyContactPerson: {
            roles: [PropertyContactPersonRole.CONTACT_PERSON],
            secondaryPhone: '',
          },
          userAccount: {
            firstName: '',
            lastName: '',
            contact: {
              email: '',
              phone: '',
            },
            username: '',
            photoUrl: '',
            serviceCompanyId: user!.userAccount.serviceCompany.id,
          },
        },
      ],
    });
  };

  return formik.values.contactPersons.length ? (
    <Box>
      {formik.values.contactPersons.map((_item, index) => (
        <Box py="1rem">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between">
            <Typography variant="h6" color="text.secondary">
              {t('Contact Person')}
            </Typography>
            {formik.values.contactPersons.length > 1 && (
              <IconButton onClick={() => deleteContact(index)} size="small">
                <Delete />
              </IconButton>
            )}
          </Box>
          <EditContactForm formik={formik} key={index} index={index} />
        </Box>
      ))}
      <Button
        buttonProps={{
          size: 'medium',
          variant: 'outlined',
          onClick: addEmptyContactPerson,
          sx: {background: 'transparent', mt: 2},
        }}>
        <Typography variant="subtitle2">{t('Add Contact person')}</Typography>
      </Button>
    </Box>
  ) : (
    <EmptySection
      illustration="clipboard"
      size="tiny"
      containerStyle={{my: '6rem'}}
      label="No Contact Persons. Do you want to add someone?"
      showActionBtn
      actionButtonIcon={<div />}
      btnLabel="Add Contact person"
      btnAction={addEmptyContactPerson}
    />
  );
};
