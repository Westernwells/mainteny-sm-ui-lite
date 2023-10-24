import {useEffect, useRef, useState} from 'react';
import Grid from '@mui/material/Grid';
import {useFormik} from 'formik';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';

import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {ServiceCompanyItem} from 'models/service-company';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {SettingsSchema} from './SettingsSchema';
import {SettingsCompanyFormModel} from './model';
import {EditSettings} from './EditSettings';

interface Props {
  containerStyles?: {[key: string]: any};
  company: ServiceCompanyItem;
}

export const Settings = ({containerStyles, company}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Company updated successfully',
  );

  const formik = useFormik<SettingsCompanyFormModel>({
    initialValues: {
      language: company?.language || '',
      dateFormat: company?.settings?.dateFormat || '',
      timeFormat: company?.settings?.timeFormat || '',
      timeZone: company?.settings?.timezone || '',
    },
    onSubmit: () => {},
  });

  const onSave = async () => {
    await updateCompany({
      body: {
        language: formik.values.language,
        dateFormat: formik.values.dateFormat,
        timezone: formik.values.timeZone,
        timeFormat: formik.values.timeFormat,
      },
      companyId: company?.id || '',
    });

    await queryClient.invalidateQueries([queryKeys.fetchCompany, company?.id]);

    setOpenDialog(false);
  };

  const labels = useRef([
    'language',
    'dateFormat',
    'timeFormat',
    'timeZone',
  ]).current;

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <>
      <InfoCard
        containerStyles={{...containerStyles}}
        handleAction={() => setOpenDialog(true)}
        header={<Typography variant="subtitle1">{t('Settings')}</Typography>}
        showHeaderBackground
        headerActionIcon={<EditIcon />}>
        <Grid container spacing={2}>
          {labels.map((label) => (
            <Grid key={label} item xs={3} md={12}>
              <SettingsSchema label={label} company={company} />
            </Grid>
          ))}
        </Grid>
      </InfoCard>
      <Dialog
        title="Edit Settings"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditSettings formik={formik} />
      </Dialog>
    </>
  );
};
