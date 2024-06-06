import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {t} from 'i18next';
import {Typography, Grid, Box, IconButton} from '@mui/material';
import {EditOutlined} from '@mui/icons-material';
import {
  AccountSystems,
  ServiceCompanyItem,
  ServiceCompanyUpdateBody,
} from 'models/service-company';
import {useCurrentCurrency} from 'utils/currency';
import {Dialog} from 'components/Dialog';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {EditGeneralInfoModal} from './EditGeneralInfoModal';

type Props = {
  company: ServiceCompanyItem;
};

const GeneralInfo = ({company}: Props) => {
  const {mutate: updateCompany} = useUpdateCompany(t('General info updated'));
  const currentCurrency = useCurrentCurrency();
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<Partial<ServiceCompanyUpdateBody>>({
    mode: 'all',
    defaultValues: {
      vatId: company?.settings?.vatId || '',
      taxNumber: company?.settings?.taxNumber || '',
    },
  });

  const handleSave = (data: Partial<ServiceCompanyUpdateBody>) =>
    updateCompany(
      {
        body: data,
        companyId: company?.id || '',
      },
      {
        onSuccess: () => setOpenDialog(false),
      },
    );

  const handleOpenModal = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <Box bgcolor="white" p={3} borderRadius={1}>
        <Grid container rowGap={0.8}>
          <Grid item xs={6}>
            <Typography variant="h5" color="primary.dark">
              {t('General info')}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <IconButton size="small" sx={{p: 0}} onClick={handleOpenModal}>
              <EditOutlined
                sx={{color: 'text.secondary', fontSize: '1.5rem'}}
              />
            </IconButton>
          </Grid>
          <Grid item xs={6} pt={3}>
            <Typography variant="body2" color="text.secondary">
              {t('VAT ID')}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right" pt={3}>
            <Typography variant="subtitle2">
              {company?.settings?.vatId || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {t('Tax ID')}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="subtitle2">
              {company?.settings?.taxNumber || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {t('Account system')}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="subtitle2">
              {company.settings.accountSystem === AccountSystems.Empty
                ? '-'
                : company.settings.accountSystem || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {t('Currency')}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="subtitle2">
              {`${currentCurrency.symbol} - ${currentCurrency.code}`}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Dialog
        title="Edit General info"
        onCancel={() => setOpenDialog(false)}
        onSave={form.handleSubmit(handleSave)}
        saveButtonText={t('Save Changes')}
        disableSaveBtn={!form.formState.isValid}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}
        dialogContentStyles={{
          mx: 0,
          mt: 0,
          px: 3,
        }}>
        <EditGeneralInfoModal form={form} />
      </Dialog>
    </>
  );
};

export default GeneralInfo;
