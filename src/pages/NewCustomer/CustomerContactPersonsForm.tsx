import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FormikProps, useFormik} from 'formik';
import * as Yup from 'yup';
import {GridRowsProp} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import Add from '@mui/icons-material/Add';
import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {formatPhoneNumber} from 'utils/customer-utils';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {InfoBanner} from 'components/InfoBanner';
import {
  CustomerContactPersonFormModel,
  CustomerContactPersonsFormModel,
  PropertyContactPersonRole,
} from './model';
import {columns, makeRows} from './ContactsWidgetDataGridProps';
import {EditContactForm} from './EditContactForm';

interface Props {
  formik: FormikProps<CustomerContactPersonsFormModel>;
}

const phoneValidationRE =
  /^\+?((\d{1,4}[ -]*)|(\([0-9]{2,3}\)[ -]*)|([0-9]{2,4})[ -]*)*?[0-9]{3,4}?[ -]*[0-9]{3,4}?$/;

const validationSchemaContactPerson = Yup.object().shape({
  propertyContactPerson: Yup.object().shape({
    roles: Yup.array().of(Yup.string()).min(1, 'Role is required'),
    secondaryPhone: Yup.string().matches(
      phoneValidationRE,
      'Phone number is not valid',
    ),
  }),
  userAccount: Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    contact: Yup.object().shape({
      email: Yup.string().email('Enter a valid email'),
      phone: Yup.string().matches(
        phoneValidationRE,
        'Phone number is not valid',
      ),
    }),
  }),
});

export const CustomerContactPersonsForm = ({formik}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContactIndex, setSelectedContactIndex] = useState<
    number | null
  >(null);

  const formikContactPerson = useFormik<CustomerContactPersonFormModel>({
    initialValues: {
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
    onSubmit: () => {},
    validationSchema: validationSchemaContactPerson,
  });

  useEffect(() => {
    setRows(makeRows({contactPersons: formik.values.contactPersons}));
  }, [formik.values.contactPersons]);

  const getEditableContacts = (index: number) => {
    const selectedContact = formik.values.contactPersons[index];
    formikContactPerson.setValues({
      propertyContactPerson: {
        ...selectedContact.propertyContactPerson,
        secondaryPhone:
          selectedContact.propertyContactPerson.secondaryPhone?.replace(
            /[^\d]/g,
            '',
          ) ?? '',
      },
      userAccount: {
        ...selectedContact.userAccount,
        contact: {
          ...selectedContact.userAccount.contact,
          phone:
            selectedContact.userAccount.contact.phone.replace(/[^\d]/g, '') ||
            '',
        },
      },
    });
    setSelectedContactIndex(index);
    setOpenDialog(true);
  };

  const deleteContact = (index: number) => {
    const updatedContactPersons = formik.values.contactPersons.filter(
      (_item, idx) => idx !== index,
    );
    formik.setValues({
      contactPersons: updatedContactPersons,
    });
  };

  const updateContacts = async () => {
    const contactPerson = {
      propertyContactPerson: {
        roles: formikContactPerson.values.propertyContactPerson.roles,
        secondaryPhone: formikContactPerson.values.propertyContactPerson
          .secondaryPhone
          ? formatPhoneNumber(
              formikContactPerson.values.propertyContactPerson.secondaryPhone,
            )
          : '',
      },
      userAccount: {
        category: '',
        contact: {
          email: formikContactPerson.values.userAccount.contact.email,
          phone: formikContactPerson.values.userAccount.contact.phone
            ? formatPhoneNumber(
                formikContactPerson.values.userAccount.contact.phone,
              )
            : '',
        },
        firstName: formikContactPerson.values.userAccount.firstName,
        lastName: formikContactPerson.values.userAccount.lastName,
        photoUrl: '',
        title: '',
        username: formikContactPerson.values.userAccount.contact.email,
        serviceCompanyId: user?.userAccount.serviceCompany.id || '',
      },
    };

    const updatedContactPersons =
      selectedContactIndex !== null
        ? formik.values.contactPersons.map((item, index) =>
            index === selectedContactIndex ? contactPerson : item,
          )
        : [...formik.values.contactPersons, contactPerson];

    formik.setValues({
      contactPersons: updatedContactPersons,
    });

    if (selectedContactIndex !== null) {
      setSelectedContactIndex(null);
    }

    setOpenDialog(false);
    formikContactPerson.resetForm();
  };

  const onCancel = () => {
    formikContactPerson.resetForm();
    setOpenDialog(false);
  };

  return (
    <InfoCard
      header={
        <Typography variant="subtitle1">{t('Contact Persons')}</Typography>
      }
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}
      handleAction={() => setOpenDialog(true)}
      headerActionIcon={
        <Typography
          color="primary.main"
          display="flex"
          alignItems="center"
          gap={1}>
          <Add fontSize="small" />
          {t('Contact Person')}
        </Typography>
      }
      showHeaderBackground>
      <InfoBanner
        title="An email address is required to invite others to Mainteny"
        body="But it is optional when setting up account."
      />
      {rows.length ? (
        <DataGridLayout
          fullHeight={false}
          isCellClickable={false}
          height={400}
          rows={rows}
          columns={columns(getEditableContacts, deleteContact)}
          isWidget
          containerStyle={{
            borderBottom: 'none',
          }}
        />
      ) : (
        <EmptySection
          illustration="clipboard"
          size="tiny"
          containerStyle={{my: '6rem'}}
          label="No Contact Persons. Do you want to add someone?"
          showActionBtn
          actionButtonIcon={<div />}
          btnLabel="Add Contact person"
          btnAction={() => setOpenDialog(true)}
        />
      )}

      <Dialog
        title={
          selectedContactIndex !== null
            ? 'Edit Contact Person'
            : 'Add Contact Person'
        }
        disableSaveBtn={!!Object.keys(formikContactPerson.errors).length}
        onCancel={onCancel}
        onSave={updateContacts}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}>
        <EditContactForm formik={formikContactPerson} />
      </Dialog>
    </InfoCard>
  );
};
