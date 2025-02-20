import React from 'react';
import {Box, Divider, Grid, Tooltip, Typography} from '@mui/material';
import {ReactComponent as ReceiptDollar} from 'assets/icons/ReceiptDollar.svg';
import {ReactComponent as PerformanceMoneyDecrease} from 'assets/icons/PerformanceMoneyDecrease.svg';
import {ReactComponent as TimeClockHand} from 'assets/icons/TimeClockHand.svg';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {usePurchaseInvoiceStatistics} from 'hooks/reactQuery/usePurchaseInvoice';
import {
  formatCurrency,
  getCurrencyFractionDigits,
  useCurrentCurrency,
} from 'utils/currency';
import {DateRange} from '@mui/x-date-pickers-pro';
import {formatDate, toRestDate} from 'utils/datetime';
import {t} from 'i18next';
import {Progress} from 'components/Progress';
import {QueryPurchaseInvoiceParams} from 'models/purchaseInvoice';

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
  <Box
    display="flex"
    flexDirection="column"
    paddingLeft={paddingLeft || '1em'}
    height="66px">
    <Box sx={{display: 'flex', alignItems: 'center', height: '22px', pb: 2}}>
      <Typography variant="h6" color="#828DA3">
        {t(title)}
      </Typography>
      <Tooltip title={t(tooltipText)} placement="top" arrow>
        <Box sx={{ml: 0.5, mb: -0.7, cursor: 'pointer'}}>
          <AlertInfoIcon width="16px" height="16px" />
        </Box>
      </Tooltip>
    </Box>
    <Box display="flex" alignItems="center" gap={1} height="37px">
      {icon}
      <Typography variant="h3" sx={{pt: '0.2em'}}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const iconStyles = {
  color: '#828DA3',
  width: '32px',
  height: '32px',
};

type Props = {
  selectedDateRange: DateRange<Date | null>;
  filters?: QueryPurchaseInvoiceParams;
};

const DashboardMetrics = ({selectedDateRange, filters}: Props) => {
  const [sentDateFrom, sentDateTo] = selectedDateRange;
  const currentCurrency = useCurrentCurrency();

  const formattedSentDateFrom = sentDateFrom ? toRestDate(sentDateFrom) : null;

  const formattedSentDateTo = sentDateTo ? toRestDate(sentDateTo) : null;

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
  const totalAmountFractionDigits =
    getCurrencyFractionDigits(totalAmountCurrency);

  const pendingAmountCurrency = Object.keys(totalPendingAmounts)[0];
  const totalPendingAmount = totalPendingAmounts[pendingAmountCurrency] || 0;
  const totalPendingFractionDigits = getCurrencyFractionDigits(
    pendingAmountCurrency,
  );

  if (isLoading) {
    return <Progress />;
  }

  return (
    <Grid
      container
      py="24px"
      mt="40px"
      mb="48px"
      pt={0}
      height="66px"
      spacing={2}
      justifyContent="space-between"
      alignItems="center">
      <Grid item xs={12} sm={3}>
        <Metric
          title="Number of invoices"
          value={numOfInvoices}
          icon={<ReceiptDollar fontSize="2.5rem" style={iconStyles} />}
          tooltipText={t(
            'Total number of invoices from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
            {
              createdDateTimeFrom: formatDate(sentDateFrom!),
              createdDateTimeTo: formatDate(sentDateTo!),
            },
          )}
        />
      </Grid>
      <Divider
        orientation="vertical"
        flexItem
        style={{borderColor: '#D9D9D9'}}
      />
      <Grid item xs={12} sm={5}>
        <Metric
          title="Total cost"
          value={formatCurrency(totalAmount / 10 ** totalAmountFractionDigits, {
            currencySymbol: currentCurrency.symbol,
          })}
          icon={
            <PerformanceMoneyDecrease fontSize="2.5rem" style={iconStyles} />
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
      <Divider
        orientation="vertical"
        flexItem
        style={{borderColor: '#D9D9D9'}}
      />
      <Grid
        item
        xs={12}
        sm={3.5}
        sx={{display: 'flex', justifyContent: 'flex-end', pr: 4}}>
        <Metric
          title="Pending payment"
          value={formatCurrency(
            totalPendingAmount / 10 ** totalPendingFractionDigits,
            {
              currencySymbol: currentCurrency.symbol,
            },
          )}
          icon={<TimeClockHand fontSize="2.5rem" style={iconStyles} />}
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
