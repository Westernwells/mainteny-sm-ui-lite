import {useEffect, useRef, useState} from 'react';
import Grid from '@mui/material/Grid';
import {useFormik} from 'formik';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';

import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {ServiceCompanyItem} from 'models/service-company';
import {useUpdateSystemSettings} from 'hooks/reactQuery/useCompanies';
import {DispatchingSchema} from './DispatchingSchema';
import {DispatchingCompanyFormModel} from './model';
import {EditDispatching} from './EditDispatching';

interface Props {
  containerStyles?: {[key: string]: any};
  company: ServiceCompanyItem;
}

export const Dispatching = ({containerStyles, company}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateSystemSettings} = useUpdateSystemSettings(
    'Company updated successfully',
  );

  const formik = useFormik<DispatchingCompanyFormModel>({
    initialValues: {
      companyDispatchStrategy: company?.settings.companyDispatchStrategy || '',
      nightlyShuffleEnabled: company?.settings.nightlyShuffleEnabled || false,
    },
    onSubmit: () => {},
  });

  const onSave = async () => {
    await updateSystemSettings({
      body: {
        companyDispatchStrategy: formik.values.companyDispatchStrategy,
        nightlyShuffleEnabled: formik.values.nightlyShuffleEnabled,
      },
      companyId: company?.id || '',
    });

    setOpenDialog(false);
  };

  const labels = useRef([
    'companyDispatchStrategy',
    'isNightlyShuffleEnabled',
  ]).current;

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
            {t('Dispatching Settings')}
          </Typography>
        }
        showHeaderBackground
        headerActionIcon={<EditIcon />}>
        <Grid container spacing={2}>
          {labels.map((label) => (
            <Grid key={label} item md={12}>
              <DispatchingSchema label={label} company={company} />
            </Grid>
          ))}
        </Grid>
      </InfoCard>
      <Dialog
        title="Edit Dispatching Settings"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditDispatching formik={formik} />
      </Dialog>
    </>
  );
};
