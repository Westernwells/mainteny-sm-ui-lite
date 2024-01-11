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
import {phoneValidationRE} from 'pages/NewEmployee/BasicEmployeeForm';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {BasicInformationSchema} from './BasicInformationSchema';
import {BasicInformationCompanyFormModel} from './model';
import {EditBasicInformation} from './EditBasicInformation';

interface Props {
  containerStyles?: {[key: string]: any};
  company: ServiceCompanyItem;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().nullable().required('name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  phone: Yup.string().matches(phoneValidationRE, 'Phone number is not valid'),
});

export const BasicInformation = ({containerStyles, company}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Company updated successfully',
  );

  const formik = useFormik<BasicInformationCompanyFormModel>({
    initialValues: {
      name: company?.name || '',
      email: company?.contact?.email || '',
      phone: company?.contact?.phone.split('+')[1] || company?.contact?.phone,
      url: company?.contact?.url || '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  const onSave = async () => {
    await updateCompany({
      body: {
        name: formik.values.name,
        email: formik.values.email,
        phone: `+${formik.values.phone.replaceAll('+', '')}`,
        url: formik.values.url,
      },
      companyId: company?.id || '',
    });

    setOpenDialog(false);
  };

  const labels = useRef(['name', 'email', 'phone', 'website']).current;

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <>
      <InfoCard
        testId="basic-info"
        containerStyles={{...containerStyles}}
        handleAction={() => setOpenDialog(true)}
        header={
          <Typography variant="subtitle1">{t('Basic Information')}</Typography>
        }
        showHeaderBackground
        headerActionIcon={<EditIcon />}>
        <Grid container spacing={2}>
          {labels.map((label) => (
            <Grid key={label} item xs={6} md={12}>
              <BasicInformationSchema label={label} company={company} />
            </Grid>
          ))}
        </Grid>
      </InfoCard>
      <Dialog
        title="Edit Basic Information"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditBasicInformation formik={formik} />
      </Dialog>
    </>
  );
};
