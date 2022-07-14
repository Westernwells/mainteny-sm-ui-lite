import {useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import {useFormik} from 'formik';
import useTheme from '@mui/material/styles/useTheme';
import * as Yup from 'yup';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import {BeachAccess} from '@mui/icons-material';

import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {CardProps} from 'components/CardProps';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {ServiceCompanyItem} from 'models/service-company';
import {PoliciesCompanyFormModel} from './model';
import {EditPolicies} from './EditPolicies';

interface Props {
  containerStyles?: {[key: string]: any};
  company: ServiceCompanyItem;
}

const validationSchema = Yup.object().shape({
  totalYearlyVacationDaysAllowed: Yup.number()
    .nullable()
    .required('Yearly Vacation Days is required')
    .min(0, 'Minimum 0'),
});

export const Policies = ({containerStyles, company}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Company updated successfully',
  );

  const formik = useFormik<PoliciesCompanyFormModel>({
    initialValues: {
      totalYearlyVacationDaysAllowed:
        company?.settings?.totalYearlyVacationDaysAllowed,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const onSave = async () => {
    await updateCompany({
      body: {
        totalYearlyVacationDaysAllowed:
          formik.values.totalYearlyVacationDaysAllowed,
      },
      companyId: company?.id || '',
    });

    setOpenDialog(false);
  };

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <>
      <InfoCard
        containerStyles={{...containerStyles}}
        handleAction={() => setOpenDialog(true)}
        header={
          <Typography variant="subtitle1">{t('Company Policies')}</Typography>
        }
        showHeaderBackground
        headerActionIcon={<EditIcon />}>
        <Grid container spacing={2}>
          <Grid item md={12}>
            <CardProps
              icon={<BeachAccess sx={{color: theme.palette.info.dark}} />}
              label="YEARLY VACATION DAYS"
              bodyText={
                company?.settings?.totalYearlyVacationDaysAllowed || '-'
              }
              iconBackground={theme.palette.info.outlinedHoverBg}
              iconMaxHeight="3em"
              containerStyles={{mt: '0.5em'}}
            />
          </Grid>
        </Grid>
      </InfoCard>
      <Dialog
        title="Edit Company Policies"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditPolicies formik={formik} />
      </Dialog>
    </>
  );
};
