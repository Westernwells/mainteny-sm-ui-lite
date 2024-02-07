import {useTranslation} from 'react-i18next';
import {useEffect, useMemo, useRef, useState} from 'react';
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
import {getServiceOrderPaymentStatusStyles} from 'pages/ServiceOrders/Tabs/ServiceOrderList.tsx/ServiceOrderDataGridProps';
import {StatusChip} from 'components/StatusChip';
import {ServiceOrderPaymentStatus} from 'models/service-order';
import {InvoiceStatus, InvoiceType} from 'models/invoice';
import {calculateGrossInvoiceTotal} from 'utils/calculate-total';
import {InfoCardTotalSumFooter} from 'components/InfoCardTotalSumFooter';
import {columns, makeRows} from './InvoicesDataGridProps';
import CreateNewInvoiceModal from './CreateNewInvoiceModal';

interface Props {
  serviceOrderId: string;
  paymentStatus?: ServiceOrderPaymentStatus;
}

export const Invoices = ({serviceOrderId, paymentStatus}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const formatDate = useFormatDate();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [openDialog, setOpenDialog] = useState(false);

  let totalInvoiceRef = useRef(0).current;

  const paymentStatusStyles = getServiceOrderPaymentStatusStyles(
    paymentStatus!,
  );
  const hasValidPaymentStatus = paymentStatusStyles.label !== '-';

  const {
    data: jobInvoices = [],
    isLoading,
    isIdle,
  } = useFetchServiceOrderInvoices(serviceOrderId);

  totalInvoiceRef = totalInvoiceRef || jobInvoices.length;

  const invoiceTypesToShow = useMemo(() => {
    const defaultTypes = [
      InvoiceType.FULL,
      InvoiceType.PARTIAL,
      InvoiceType.UPFRONT,
    ];

    const allJobsAreCancelled = jobInvoices.every(
      (i) => i.status === InvoiceStatus.CANCELLED,
    );
    if (allJobsAreCancelled) {
      return defaultTypes;
    }

    const jobHasFullInvoice = jobInvoices.find(
      (i) => i.type === InvoiceType.FULL,
    );
    if (jobHasFullInvoice) {
      return [InvoiceType.FULL];
    }

    const jobHasPartialInvoice = jobInvoices.find(
      (i) => i.type === InvoiceType.PARTIAL,
    );
    if (jobHasPartialInvoice) {
      return [InvoiceType.FINAL, InvoiceType.PARTIAL];
    }

    const jobHasUpfrontInvoice = jobInvoices.find(
      (i) => i.type === InvoiceType.UPFRONT,
    );
    if (jobHasUpfrontInvoice) {
      return [InvoiceType.FINAL, InvoiceType.PARTIAL, InvoiceType.UPFRONT];
    }

    return defaultTypes;
  }, [jobInvoices]);

  useEffect(() => {
    if (!isLoading) {
      setRows(
        makeRows(
          jobInvoices || [],
          user?.userAccount.serviceCompany.id,
          formatDate,
        ),
      );
    }
  }, [jobInvoices, isLoading]);

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
      footer={
        jobInvoices &&
        jobInvoices?.length !== 0 && (
          <InfoCardTotalSumFooter
            amount={jobInvoices && calculateGrossInvoiceTotal(jobInvoices)}
            label={t('Invoiced Sum (incl. VAT)')}
          />
        )
      }
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
          height={getDataGridHeight(rows.length, rows.length, 70)}
          columns={columns}
          fullHeight={false}
          containerStyle={{
            borderBottom: 'none',
          }}
          isWidget
        />
      )}
      <CreateNewInvoiceModal
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
        }}
        orderId={serviceOrderId}
        invoiceTypesToShow={invoiceTypesToShow}
      />
    </InfoCard>
  );
};
