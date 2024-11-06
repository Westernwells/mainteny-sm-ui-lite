import React from 'react';
import {Grid, Typography, Box, Tooltip} from '@mui/material';
import {ReactComponent as ReceiptDollar} from 'assets/icons/ReceiptDollar.svg';
import {ReactComponent as PerformanceMoneyDecrease} from 'assets/icons/PerformanceMoneyDecrease.svg';
import {ReactComponent as TimeClockHand} from 'assets/icons/TimeClockHand.svg';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {usePurchaseInvoiceStatistics} from 'hooks/reactQuery/usePurchaseInvoice';
import {formatCurrency, getCurrencySymbol} from 'utils/currency';
import {DateRange} from '@mui/x-date-pickers-pro';
import {formatDate, toRestDateTimeFormat} from 'utils/datetime';
import {t} from 'i18next';
import {Progress} from 'components/Progress';

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
};

const DashboardMetrics = ({selectedDateRange}: Props) => {
  const [createdDateTimeFrom, createdDateTimeTo] = selectedDateRange;

  const formattedCreatedDateTimeFrom = createdDateTimeFrom
    ? toRestDateTimeFormat(createdDateTimeFrom)
    : null;

  const formattedCreatedDateTimeTo = createdDateTimeTo
    ? toRestDateTimeFormat(createdDateTimeTo)
    : null;

  const {data: purchaseInvoiceStatistics, isLoading} =
    usePurchaseInvoiceStatistics({
      createdDateTimeFrom: formattedCreatedDateTimeFrom,
      createdDateTimeTo: formattedCreatedDateTimeTo,
    });

  const numOfInvoices = purchaseInvoiceStatistics?.numOfInvoices || 0;
  const totalAmounts = purchaseInvoiceStatistics?.totalAmounts || {};
  const totalPendingAmounts =
    purchaseInvoiceStatistics?.totalPendingAmounts || {};

  const totalAmountCurrency = Object.keys(totalAmounts)[0];
  const totalAmount = totalAmounts[totalAmountCurrency] || 0;
  const currencySymbol = getCurrencySymbol[totalAmountCurrency] || '';

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
              createdDateTimeFrom: formatDate(createdDateTimeFrom!),
              createdDateTimeTo: formatDate(createdDateTimeTo!),
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
          value={formatCurrency(totalAmount, {currencySymbol})}
          icon={
            <PerformanceMoneyDecrease
              fontSize="2.5rem"
              style={{color: '#828DA3'}}
            />
          }
          tooltipText={t(
            'Aggregate cost of all invoices from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
            {
              createdDateTimeFrom: formatDate(createdDateTimeFrom!),
              createdDateTimeTo: formatDate(createdDateTimeTo!),
            },
          )}
          paddingLeft="30%"
        />
      </Grid>

      <Grid item xs={12} sm={3}>
        <Metric
          title="Pending payment"
          value={formatCurrency(totalPendingAmount, {
            currencySymbol: pendingAmountCurrency,
          })}
          icon={<TimeClockHand fontSize="2.5rem" style={{color: '#828DA3'}} />}
          tooltipText={t(
            'Aggregated outstanding amount of all invoices from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
            {
              createdDateTimeFrom: formatDate(createdDateTimeFrom!),
              createdDateTimeTo: formatDate(createdDateTimeTo!),
            },
          )}
        />
      </Grid>
    </Grid>
  );
};

export default DashboardMetrics;
