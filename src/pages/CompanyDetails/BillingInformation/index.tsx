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
import {BillingInformationSchema} from './BillingInformationSchema';
import {BillingInformationCompanyFormModel} from './model';
import {EditBillingInformation} from './EditBillingInformation';

interface Props {
  containerStyles?: {[key: string]: any};
  company: ServiceCompanyItem;
}

const validationSchema = Yup.object().shape({
  vatId: Yup.string().nullable().required('VAT ID is required'),
  percentageVat: Yup.number()
    .nullable()
    .required('% VAT is required')
    .min(0, 'Minimum 0')
    .max(100, 'Maximum 100'),
});

export const BillingInformation = ({containerStyles, company}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Company updated successfully',
  );

  const formik = useFormik<BillingInformationCompanyFormModel>({
    initialValues: {
      vatId: company?.settings?.vatId || '',
      percentageVat: company?.settings?.percentageVat || 0,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const onSave = async () => {
    await updateCompany({
      body: {
        vatId: formik.values.vatId,
        percentageVat: formik.values.percentageVat,
      },
      companyId: company?.id || '',
    });

    setOpenDialog(false);
  };

  const labels = useRef(['vatId', 'percentageVat']).current;

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
            {t('Billing Information')}
          </Typography>
        }
        showHeaderBackground
        headerActionIcon={<EditIcon />}>
        <Grid container spacing={2}>
          {labels.map((label) => (
            <Grid key={label} item xs={3} md={12}>
              <BillingInformationSchema label={label} company={company} />
            </Grid>
          ))}
        </Grid>
      </InfoCard>
      <Dialog
        title="Edit Billing Information"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditBillingInformation formik={formik} />
      </Dialog>
    </>
  );
};
