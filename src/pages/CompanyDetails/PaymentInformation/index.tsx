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
import {PaymentInformationSchema} from './PaymentInformationSchema';
import {PaymentInformationCompanyFormModel} from './model';
import {EditPaymentInformation} from './EditPaymentInformation';

interface Props {
  containerStyles?: {[key: string]: any};
  company: ServiceCompanyItem;
}

const validationSchema = Yup.object().shape({
  iban: Yup.string().nullable().required('IBAN is required'),
  bic: Yup.string().nullable().required('BIC is required'),
});

export const PaymentInformation = ({containerStyles, company}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Company updated successfully',
  );

  const formik = useFormik<PaymentInformationCompanyFormModel>({
    initialValues: {
      iban: company?.settings?.paymentInfo?.iban || '',
      bic: company?.settings?.paymentInfo?.bic || '',
      accountNumber: company?.settings?.paymentInfo?.accountNumber || '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  const onSave = async () => {
    await updateCompany({
      body: {
        paymentInfo: {
          // TODO: this section will be removed in Basic Info UI update. applied below changes temporarily to just fix type error
          bankName: '',
          iban: formik.values.iban,
          bic: formik.values.bic,
          accountNumber: formik.values.accountNumber,
        },
      },
      companyId: company?.id || '',
    });

    setOpenDialog(false);
  };

  const labels = useRef(['iban', 'bic', 'accountNumber']).current;

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <>
      <InfoCard
        containerStyles={{...containerStyles}}
        handleAction={() => setOpenDialog(true)}
        header={
          <Typography variant="subtitle1">
            {t('Payment Information')}
          </Typography>
        }
        showHeaderBackground
        headerActionIcon={<EditIcon />}>
        <Grid container spacing={2}>
          {labels.map((label) => (
            <Grid key={label} item xs={3} md={12}>
              <PaymentInformationSchema label={label} company={company} />
            </Grid>
          ))}
        </Grid>
      </InfoCard>
      <Dialog
        title="Edit Payment Information"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditPaymentInformation formik={formik} />
      </Dialog>
    </>
  );
};
