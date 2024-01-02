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
import {getServiceOrderPaymentStatusStyles} from 'pages/ServiceOrders/Tabs/ServiceOrderList.tsx/ServiceOrderDataGridProps';
import {StatusChip} from 'components/StatusChip';
import {ServiceOrderPaymentStatus} from 'models/service-order';
import {calculateGrossInvoiceTotal} from 'utils/calculate-total';
import {InfoCardTotalSumFooter} from 'components/InfoCardTotalSumFooter';
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
        InvoiceList &&
        InvoiceList?.length !== 0 && (
          <InfoCardTotalSumFooter
            amount={InvoiceList && calculateGrossInvoiceTotal(InvoiceList)}
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
      handleAction={() => navigate(`/invoices/new?orderId=${serviceOrderId}`)}
      headerActionIcon={
        <Typography color="info.main">{`+ ${t('Add')}`}</Typography>
      }
      showHeaderBackground>
      {!totalInvoiceRef ? (
        renderNoRowsSection()
      ) : (
        <DataGridLayout
          rows={rows}
          height={getDataGridHeight(rows.length, 100)}
          columns={columns}
          fullHeight={false}
          containerStyle={{
            borderBottom: 'none',
          }}
          isWidget
        />
      )}
    </InfoCard>
  );
};
