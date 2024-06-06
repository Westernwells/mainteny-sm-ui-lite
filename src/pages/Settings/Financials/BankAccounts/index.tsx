import {MouseEvent, useState} from 'react';
import {useForm} from 'react-hook-form';
import {t} from 'i18next';
import {Trans} from 'react-i18next';
import {theme} from 'theme';
import {Typography, Box, Avatar, IconButton} from '@mui/material';
import {AddOutlined, DeleteOutline} from '@mui/icons-material';
import {ServiceCompanyItem} from 'models/service-company';
import {PaymentInfo} from 'models/misc';
import {Button} from 'components/Button';
import {EmptySection} from 'components/EmptySection';
import {Dialog} from 'components/Dialog';
import {Confirm} from 'components/Confirm';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {BankAccountsModal} from './BankAccountsModal';

type Props = {
  company: ServiceCompanyItem;
};

const BankAccount = ({
  bankAccount,
  onClick,
  onDelete,
}: {
  bankAccount: PaymentInfo;
  onClick: () => void;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
}) => (
  <Box
    display="flex"
    flexDirection="column"
    flex={1}
    maxWidth="50%"
    rowGap={3}
    p={3}
    bgcolor={theme.palette.inputBackground.main}
    border={`1px solid ${theme.palette.action.disabledBackground}`}
    borderRadius={1}
    sx={{
      '&:hover': {
        cursor: 'pointer',
        boxShadow: `0px 4px 15px 0px ${theme.palette.suvaGrey.light}`,
      },
    }}
    onClick={onClick}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center">
        <Avatar>{bankAccount?.bankName?.[0] || 'B'}</Avatar>
        <Typography variant="h6" color="primary.dark" pl={1.5}>
          {bankAccount.bankName}
        </Typography>
      </Box>
      <IconButton size="small" onClick={onDelete}>
        <DeleteOutline sx={{color: 'text.secondary'}} />
      </IconButton>
    </Box>
    <Box display="flex" flexDirection="column" gap={1}>
      {[
        {label: t('IBAN'), value: bankAccount.iban},
        {
          label: t('Account number'),
          value: bankAccount.accountNumber,
        },
        {label: t('BIC'), value: bankAccount.bic},
      ].map((item, idx) => (
        <Box
          key={idx}
          display="flex"
          alignItems="center"
          justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {item.label}
          </Typography>
          <Typography variant="subtitle2" color="primary.dark">
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

const BankAccounts = ({company}: Props) => {
  const {mutate: updateCompany} = useUpdateCompany(t('Bank accounts updated'));
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const [selectedKey, setSelectedKey] = useState<
    'paymentInfo' | 'paymentInfo2' | ''
  >('');
  const selectedBank = selectedKey ? company?.settings?.[selectedKey] : null;
  const form = useForm<PaymentInfo>({
    mode: 'all',
    defaultValues: {
      bankName: '',
      iban: '',
      bic: '',
    },
  });

  const handleSave = (data: PaymentInfo) => {
    const key =
      selectedKey ||
      (company.settings.paymentInfo ? 'paymentInfo2' : 'paymentInfo');

    updateCompany(
      {
        body: {[key]: data},
        companyId: company?.id || '',
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          setSelectedKey('');
        },
      },
    );
  };

  const onDelete = (
    event: MouseEvent<HTMLButtonElement>,
    key: 'paymentInfo' | 'paymentInfo2',
  ) => {
    event.stopPropagation();
    setOpenConfirmDialog(true);
    setSelectedKey(key);
  };

  const handleDelete = () => {
    updateCompany(
      {
        body: {[selectedKey]: null},
        companyId: company?.id || '',
      },
      {
        onSuccess: () => {
          setOpenConfirmDialog(false);
          setSelectedKey('');
        },
      },
    );
  };

  const resetForm = (data?: PaymentInfo) => {
    form.reset(
      data || {
        bankName: '',
        iban: '',
        bic: '',
      },
    );
  };

  const handleOpenModal = (key?: 'paymentInfo' | 'paymentInfo2') => {
    setOpenDialog(true);
    if (key) {
      setSelectedKey(key);
      resetForm(company?.settings?.[key]);
    } else {
      setSelectedKey('');
    }
  };

  const bankAccounts = [
    company.settings?.paymentInfo,
    company.settings?.paymentInfo2,
  ].filter(Boolean);

  return (
    <>
      <Box bgcolor="white" p={3} borderRadius={1}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" color="primary.dark">
            {t('Bank accounts')}
          </Typography>
          {bankAccounts.length > 0 && bankAccounts.length < 2 ? (
            <Button
              buttonProps={{
                size: 'large',
                variant: 'text',
                onClick: () => handleOpenModal(),
              }}>
              <AddOutlined />
              <Typography variant="subtitle1" fontWeight="bold" pl={1} pt={0.5}>
                {t('New Account')}
              </Typography>
            </Button>
          ) : null}
        </Box>

        {bankAccounts.length > 0 ? (
          <Box display="flex" flexWrap="wrap" gap={3} pt={3}>
            {company.settings?.paymentInfo && (
              <BankAccount
                bankAccount={company.settings?.paymentInfo}
                onClick={() => handleOpenModal('paymentInfo')}
                onDelete={(event) => onDelete(event, 'paymentInfo')}
              />
            )}
            {company.settings?.paymentInfo2 && (
              <BankAccount
                bankAccount={company.settings?.paymentInfo2}
                onClick={() => handleOpenModal('paymentInfo2')}
                onDelete={(event) => onDelete(event, 'paymentInfo2')}
              />
            )}
          </Box>
        ) : (
          <EmptySection
            showActionBtn
            illustration="bankAccounts"
            size="tiny"
            containerStyle={{
              my: 4,
            }}
            label="No bank accounts"
            labelStyle={{
              typography: 'h6',
              color: theme.palette.primary.dark,
            }}
            subLabel="Add a bank account to start using the service"
            subLabelProps={{
              color: theme.palette.text.secondary,
            }}
            btnLabel="New Account"
            btnSize="medium"
            btnAction={() => handleOpenModal()}
          />
        )}
      </Box>
      <Dialog
        title={selectedBank ? 'Edit Bank Account' : 'New Bank Account'}
        onCancel={() => setOpenDialog(false)}
        onSave={form.handleSubmit(handleSave)}
        saveButtonText={t('Save Changes')}
        disableSaveBtn={!form.formState.isValid}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}
        dialogContentStyles={{
          mx: 0,
          mt: 0,
          px: 3,
        }}>
        <BankAccountsModal form={form} />
      </Dialog>
      <Confirm
        maxWidth={410}
        open={openConfirmDialog}
        onConfirm={handleDelete}
        onClose={() => setOpenConfirmDialog(false)}
        title="Remove bank account"
        content={
          <Trans
            defaults="You are about to remove <bold>{{bankName}}</bold> account from your Bank Accounts."
            values={{bankName: selectedBank?.bankName}}
            components={{bold: <strong />}}
          />
        }
        secondContent="Are you sure about it?"
        closeBtnLabel="Cancel"
        confirmBtnLabel="Remove Account"
      />
    </>
  );
};

export default BankAccounts;
