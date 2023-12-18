import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useEffect, useRef, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import Typography from '@mui/material/Typography';
import {useFetchServiceOrderInvoices} from 'hooks/reactQuery/useInvoice';
import {InfoCard} from 'components/InfoCard';
import Box from '@mui/material/Box';
import {getDataGridHeight} from 'utils/utils';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {useFormatDate} from 'hooks/useFormatDate';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {Button} from 'components/Button';
import {ReactComponent as FinalInvoiceIcon} from 'assets/icons/FinalInvoiceIcon.svg';
import {ReactComponent as UpfrontInvoiceIcon} from 'assets/icons/UpfrontInvoiceIcon.svg';
import {ReactComponent as PartialInvoiceIcon} from 'assets/icons/PartialInvoiceIcon.svg';
import {ReactComponent as CreditNoteIcon} from 'assets/icons/CreditNoteIcon.svg';
import {RadioGroup} from '@mui/material';
import {InvoiceType} from 'models/invoice';
import {getServiceOrderPaymentStatusStyles} from 'pages/ServiceOrders/Tabs/ServiceOrderList.tsx/ServiceOrderDataGridProps';
import {StatusChip} from 'components/StatusChip';
import {ServiceOrderPaymentStatus} from 'models/service-order';
import InvoiceOption from './InvoiceOption';
import {columns, makeRows} from './InvoicesDataGridProps';

interface Props {
  serviceOrderId?: string;
  paymentStatus?: ServiceOrderPaymentStatus;
}

export const Invoices = ({serviceOrderId, paymentStatus}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [value, setValue] = useState<InvoiceType | null>(null);

  const handleChange = (invoiceType: InvoiceType) => {
    setValue(invoiceType);
  };

  let totalInvoiceRef = useRef(0).current;

  const paymentStatusStyles = getServiceOrderPaymentStatusStyles(
    paymentStatus!,
  );
  const hasValidPaymentStatus = paymentStatusStyles.label !== '-';

  const {
    data: InvoiceList = [],
    isLoading,
    isIdle,
  } = useFetchServiceOrderInvoices(serviceOrderId);

  totalInvoiceRef = totalInvoiceRef || InvoiceList.length;

  useEffect(() => {
    if (!isLoading) {
      setRows(
        makeRows(
          InvoiceList || [],
          user?.userAccount.serviceCompany.id,
          formatDate,
        ),
      );
    }
  }, [InvoiceList, isLoading]);

  const iconStyle = {
    fontSize: '3.5rem',
    flex: '0 0 20%',
  };

  const invoiceTypeOptions = [
    {
      label: 'Final Invoice',
      description:
        'Straight-forward transaction requiring full payment upon delivery of goods or completion of services.',
      icon: <FinalInvoiceIcon style={iconStyle} />,
      invoiceType: InvoiceType.FINAL,
    },
    {
      label: 'Partial Invoice',
      description:
        'For transactions where the payment will be made in multiple installments over a period of time.',
      icon: <PartialInvoiceIcon style={iconStyle} />,
      invoiceType: InvoiceType.PARTIAL,
    },

    {
      label: 'Upfront Invoice',
      description:
        'Use when full payment is required before the delivery of goods or services.',
      icon: <UpfrontInvoiceIcon style={iconStyle} />,
      invoiceType: InvoiceType.UPFRONT,
    },
    {
      label: 'Credit Note',
      description:
        'Correction or adjustment to an already issued invoice, typically used for refunds, returns, or errors.',
      icon: <CreditNoteIcon style={iconStyle} />,
      invoiceType: InvoiceType.CREDIT_NOTE,
    },
  ];

  const renderNoRowsSection = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
      <EmptySection
        illustration="clipboard"
        size="tiny"
        containerStyle={{m: 'auto', width: '60%'}}
        label="No invoices yet. They will appear here once added."
      />
    </Box>
  );

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return (
    <InfoCard
      header={
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Typography variant="subtitle1" sx={{marginRight: '1em'}}>
            {t('Invoices')}
          </Typography>
          {hasValidPaymentStatus && (
            <StatusChip
              label={paymentStatusStyles.label}
              color={paymentStatusStyles.color}
              maxChars={8}
            />
          )}
        </Box>
      }
      handleAction={() => setOpenDialog(true)}
      headerActionIcon={
        <Typography color="info.main">{`+ ${t('Add')}`}</Typography>
      }
      showHeaderBackground>
      {!totalInvoiceRef ? (
        renderNoRowsSection()
      ) : (
        <DataGridLayout
          rows={rows}
          height={getDataGridHeight(rows.length, 3)}
          columns={columns}
          fullHeight={false}
          containerStyle={{
            borderBottom: 'none',
          }}
        />
      )}
      <Dialog
        open={openDialog || false}
        onClose={() => {
          setOpenDialog(false);
          setValue(null);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            p: '1.5rem',
          },
        }}>
        <DialogTitle id="alert-dialog-title" sx={{px: 0, pt: 0}}>
          {t('Create new invoice')}
        </DialogTitle>
        <DialogContent sx={{p: 0, pb: '0.5rem'}}>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={value}>
            {invoiceTypeOptions.map((item) => (
              <InvoiceOption
                key={item.invoiceType}
                label={item.label}
                description={item.description}
                icon={item.icon}
                invoiceType={item.invoiceType}
                activeValue={value}
                handleClick={() => handleChange(item.invoiceType)}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button
            buttonProps={{
              size: 'medium',
              variant: 'text',
              onClick: () => setOpenDialog(false),
              sx: {
                textTransform: 'capitalize',
              },
            }}>
            <Typography variant="subtitle2">{t('Cancel')}</Typography>
          </Button>
          <Button
            buttonProps={{
              size: 'medium',
              variant: 'contained',
              autoFocus: true,
              disabled: !value,
              onClick: () => navigate(`/invoices/new?invoiceType=${value}`),
              sx: {
                textTransform: 'capitalize',
              },
            }}>
            <Typography variant="subtitle2">{t('Create')}</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </InfoCard>
  );
};
