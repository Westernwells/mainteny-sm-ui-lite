import React from 'react';
import {Grid, Typography, Box, Tooltip} from '@mui/material';
import {ReactComponent as ReceiptDollar} from 'assets/icons/ReceiptDollar.svg';
import {ReactComponent as PerformanceMoneyDecrease} from 'assets/icons/PerformanceMoneyDecrease.svg';
import {ReactComponent as TimeClockHand} from 'assets/icons/TimeClockHand.svg';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {usePurchaseInvoiceStatistics} from 'hooks/reactQuery/usePurchaseInvoice';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {DateRange} from '@mui/x-date-pickers-pro';
import {formatDate} from 'utils/datetime';
import {t} from 'i18next';
import {Progress} from 'components/Progress';
import {QueryPurchaseInvoiceParams} from 'models/purchaseInvoice';
import {endOfDay, startOfDay} from 'date-fns';

type MetricProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  tooltipText: string;
  paddingLeft?: string;
};

const Metric = ({
  title,
  value,
  icon,
  tooltipText,
  paddingLeft,
}: MetricProps) => (
  <Box display="flex" flexDirection="column" paddingLeft={paddingLeft || '2em'}>
    <Box sx={{display: 'flex', alignItems: 'center'}}>
      <Typography variant="h6">{t(title)}</Typography>
      <Tooltip title={t(tooltipText)} placement="top" arrow>
        <Box sx={{ml: 0.5, mb: -0.7, cursor: 'pointer'}}>
          <AlertInfoIcon width="16px" height="16px" />
        </Box>
      </Tooltip>
    </Box>
    <Box display="flex" alignItems="center" gap={1}>
      {icon}
      <Typography variant="h3" sx={{pt: '0.2em'}}>
        {value}
      </Typography>
    </Box>
  </Box>
);

type Props = {
  selectedDateRange: DateRange<Date | null>;
  filters?: QueryPurchaseInvoiceParams;
};

const DashboardMetrics = ({selectedDateRange, filters}: Props) => {
  const [sentDateFrom, sentDateTo] = selectedDateRange;
  const currentCurrency = useCurrentCurrency();

  const formattedSentDateFrom = sentDateFrom
    ? startOfDay(sentDateFrom).toISOString().split('T')[0]
    : null;

  const formattedSentDateTo = sentDateTo
    ? endOfDay(sentDateTo).toISOString().split('T')[0]
    : null;

  const {data: purchaseInvoiceStatistics, isLoading} =
    usePurchaseInvoiceStatistics({
      ...filters,
      sentDateFrom: formattedSentDateFrom!,
      sentDateTo: formattedSentDateTo!,
    });

  const numOfInvoices = purchaseInvoiceStatistics?.numOfInvoices || 0;
  const totalAmounts = purchaseInvoiceStatistics?.totalAmounts || {};
  const totalPendingAmounts =
    purchaseInvoiceStatistics?.totalPendingAmounts || {};

  const totalAmountCurrency = Object.keys(totalAmounts)[0];
  const totalAmount = totalAmounts[totalAmountCurrency] || 0;

  const pendingAmountCurrency = Object.keys(totalPendingAmounts)[0];
  const totalPendingAmount = totalPendingAmounts[pendingAmountCurrency] || 0;

  if (isLoading) {
    return <Progress />;
  }

  return (
    <Grid
      container
      py={4}
      spacing={2}
      justifyContent="space-between"
      alignItems="center">
      <Grid item xs={12} sm={3} sx={{borderRight: '1px solid gray'}}>
        <Metric
          title="Number of invoices"
          value={numOfInvoices}
          icon={<ReceiptDollar fontSize="2.5rem" style={{color: '#828DA3'}} />}
          tooltipText={t(
            'Total number of invoices from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
            {
              createdDateTimeFrom: formatDate(sentDateFrom!),
              createdDateTimeTo: formatDate(sentDateTo!),
            },
          )}
        />
      </Grid>

      <Grid
        item
        xs={12}
        sm={5.5}
        sx={{borderRight: '1px solid gray', alignItems: 'center'}}>
        <Metric
          title="Total cost"
          value={formatCurrency(totalAmount, {
            currencySymbol: currentCurrency.symbol,
          })}
          icon={
            <PerformanceMoneyDecrease
              fontSize="2.5rem"
              style={{color: '#828DA3'}}
            />
          }
          tooltipText={t(
            'Aggregate cost of all invoices from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
            {
              createdDateTimeFrom: formatDate(sentDateFrom!),
              createdDateTimeTo: formatDate(sentDateTo!),
            },
          )}
          paddingLeft="30%"
        />
      </Grid>

      <Grid item xs={12} sm={3}>
        <Metric
          title="Pending payment"
          value={formatCurrency(totalPendingAmount, {
            currencySymbol: currentCurrency.symbol,
          })}
          icon={<TimeClockHand fontSize="2.5rem" style={{color: '#828DA3'}} />}
          tooltipText={t(
            'Aggregated outstanding amount of all invoices from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
            {
              createdDateTimeFrom: formatDate(sentDateFrom!),
              createdDateTimeTo: formatDate(sentDateTo!),
            },
          )}
        />
      </Grid>
    </Grid>
  );
};

export default DashboardMetrics;
