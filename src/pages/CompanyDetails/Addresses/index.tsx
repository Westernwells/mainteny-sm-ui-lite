import {useEffect, useRef, useState} from 'react';
import Grid from '@mui/material/Grid';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';

import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {ServiceCompanyItem} from 'models/service-company';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {AddressesSchema} from './AddressesSchema';
import {AddressesCompanyFormModel} from './model';
import {EditAddresses} from './EditAddresses';

interface Props {
  containerStyles?: {[key: string]: any};
  company: ServiceCompanyItem;
}

const validationSchema = Yup.object().shape({
  billingAddress: Yup.object()
    .nullable()
    .required('Billing Address is required'),
  postalAddress: Yup.object().nullable().required('Postal Address is required'),
  businessAddress: Yup.object()
    .nullable()
    .required('Business Address is required'),
});

export const Addresses = ({containerStyles, company}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Company updated successfully',
  );

  const formik = useFormik<AddressesCompanyFormModel>({
    initialValues: {
      postalAddress: company.postalAddress ? company.postalAddress : null,
      billingAddress: company.billingAddress ? company.billingAddress : null,
      businessAddress: company.businessAddress ? company.businessAddress : null,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const onSave = async () => {
    await updateCompany({
      body: {
        postalAddress: formik.values.postalAddress!,
        billingAddress: formik.values.billingAddress!,
        businessAddress: formik.values.businessAddress!,
      },
      companyId: company?.id || '',
    });

    setOpenDialog(false);
  };

  const labels = useRef(['billing', 'business', 'postal']).current;

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <>
      <InfoCard
        containerStyles={{...containerStyles}}
        handleAction={() => setOpenDialog(true)}
        header={<Typography variant="subtitle1">{t('Addresses')}</Typography>}
        showHeaderBackground
        headerActionIcon={<EditIcon />}>
        <Grid container spacing={2}>
          {labels.map((label) => (
            <Grid key={label} item xs={3} md={12}>
              <AddressesSchema label={label} company={company} />
            </Grid>
          ))}
        </Grid>
      </InfoCard>
      <Dialog
        title="Edit Addresses"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditAddresses formik={formik} />
      </Dialog>
    </>
  );
};
