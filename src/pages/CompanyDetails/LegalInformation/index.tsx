import {useRef, useState} from 'react';
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
import {LegalInformationSchema} from './LegalInformationSchema';
import {LegalInformationCompanyFormModel} from './model';
import {EditLegalInformation} from './EditLegalInformation';

interface Props {
  containerStyles?: {[key: string]: any};
  company: ServiceCompanyItem;
}

const validationSchema = Yup.object().shape({
  managingDirector: Yup.string()
    .nullable()
    .required('Managing Director is required'),
  arbitrationCourt: Yup.string()
    .nullable()
    .required('Arbitration Court is required'),
  tradeRegisterNumber: Yup.string()
    .nullable()
    .required('Trade Register Number is required'),
});

export const LegalInformation = ({containerStyles, company}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Company updated successfully',
  );

  const formik = useFormik<LegalInformationCompanyFormModel>({
    initialValues: {
      managingDirector: company?.settings?.managingDirector || '',
      arbitrationCourt: company?.settings?.arbitrationCourt || '',
      tradeRegisterNumber: company?.settings?.tradeRegisterNumber || '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  const onSave = async () => {
    await updateCompany({
      body: {
        managingDirector: formik.values.managingDirector,
        arbitrationCourt: formik.values.arbitrationCourt,
        tradeRegisterNumber: formik.values.tradeRegisterNumber,
      },
      companyId: company?.id || '',
    });

    setOpenDialog(false);
  };

  const labels = useRef([
    'managingDirector',
    'arbitrationCourt',
    'tradeRegisterNumber',
  ]).current;

  return (
    <>
      <InfoCard
        containerStyles={{...containerStyles}}
        handleAction={() => setOpenDialog(true)}
        header={
          <Typography variant="subtitle1">{t('Legal Information')}</Typography>
        }
        showHeaderBackground
        headerActionIcon={<EditIcon />}>
        <Grid container spacing={2}>
          {labels.map((label) => (
            <Grid key={label} item md={12}>
              <LegalInformationSchema label={label} company={company} />
            </Grid>
          ))}
        </Grid>
      </InfoCard>
      <Dialog
        title="Edit Legal Information"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditLegalInformation formik={formik} />
      </Dialog>
    </>
  );
};
