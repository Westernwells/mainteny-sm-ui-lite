import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {t} from 'i18next';
import {Typography, Grid, Box, IconButton, Tooltip} from '@mui/material';
import {EditOutlined, InfoOutlined} from '@mui/icons-material';
import {
  AccountSystems,
  ServiceCompanyItem,
  ServiceCompanyUpdateBody,
} from 'models/service-company';
import {useCurrentCurrency} from 'utils/currency';
import {Dialog} from 'components/Dialog';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {toRestDate} from 'utils/datetime';
import {EditGeneralInfoModal} from './EditGeneralInfoModal';

type Props = {
  company: ServiceCompanyItem;
};

const GeneralInfoItemLabel = ({
  label,
  toolTip,
}: {
  label: string;
  toolTip?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Grid item xs={6}>
      <Box display="flex" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {t(label)}
        </Typography>
        {!!toolTip && (
          <Tooltip
            onOpen={() => {
              setIsOpen(true);
            }}
            onClose={() => {
              setIsOpen(false);
            }}
            title={t(toolTip)}
            placement="right"
            arrow>
            <IconButton
              sx={{
                color: isOpen ? 'action.active' : 'secondary.mainLight',
                p: 0,
                ml: 0.5,
              }}>
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Grid>
  );
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
      fiscalYearStart: company.settings.fiscalYearStart,
      accountantNumber: company.settings.accountantNumber,
      clientNumber: company.settings.clientNumber,
    },
  });

  const handleSave = (data: Partial<ServiceCompanyUpdateBody>) =>
    updateCompany(
      {
        body: {
          ...data,
          accountSystem: data.accountSystem
            ? data.accountSystem
            : AccountSystems.Empty,
          fiscalYearStart: data.fiscalYearStart
            ? toRestDate(new Date(data.fiscalYearStart))
            : data.fiscalYearStart,
        },
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
          <GeneralInfoItemLabel
            label="Accountant number"
            toolTip="Reference number of your external accountant. If not available please ask your accountant."
          />
          <Grid item xs={6} textAlign="right">
            <Typography variant="subtitle2">
              {company.settings.accountantNumber ?? '-'}
            </Typography>
          </Grid>
          <GeneralInfoItemLabel
            label="Client number"
            toolTip="Your accounting client number. If not available please ask your accountant."
          />
          <Grid item xs={6} textAlign="right">
            <Typography variant="subtitle2">
              {company.settings.clientNumber ?? '-'}
            </Typography>
          </Grid>
          <GeneralInfoItemLabel
            label="Start of fiscal year"
            toolTip="When does your company's fiscal year start? This can be different from the beginning of the calendar year."
          />
          <Grid item xs={6} textAlign="right">
            <Typography variant="subtitle2">
              {company.settings.fiscalYearStart ?? '-'}
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
