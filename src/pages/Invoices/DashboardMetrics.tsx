import {Box, Divider, Grid} from '@mui/material';
import Metric from 'components/Metric';
import {ReactComponent as ReceiptDollar} from 'assets/icons/ReceiptDollar.svg';
import {ReactComponent as TimeClockFire} from 'assets/icons/TimeClockFire.svg';
import {ReactComponent as DataFileBarsCash} from 'assets/icons/DataFileBarsCash.svg';
import {ReactComponent as CashPaymentCoins} from 'assets/icons/CashPaymentCoins.svg';
import {ReactComponent as TimeClockHand} from 'assets/icons/TimeClockHand.svg';
import {useTranslation} from 'react-i18next';
import {formatDate, getPastDateRange} from 'utils/datetime';
import React, {useMemo} from 'react';
import {useInvoiceStatistics} from 'hooks/reactQuery/useInvoice';
import {InvoiceStatistics, QueryInvoiceParams} from 'models/invoice';
import {aggregateInvoiceStatistics, calculatePercentChange} from 'utils/utils';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';

const iconStyles = {
  color: '#828DA3',
  width: '27px',
  height: '27px',
};

const RowItem = ({children}: {children: React.ReactElement}) => (
  <Grid xs={12} sm={4} md>
    {children}
  </Grid>
);

type Props = {
  invoiceStatistics?: InvoiceStatistics;
  filters?: QueryInvoiceParams;
};

const DashboardMetrics = ({invoiceStatistics, filters}: Props) => {
  const {t} = useTranslation();

  const currentCurrency = useCurrentCurrency();
  const {pastFrom, pastTo} = getPastDateRange(
    filters?.sentDateFrom,
    filters?.sentDateTo,
  );

  // Fetch past period statistics, we do not need to fetch current stats because it is already
  // fetched in the component where this is currently used
  const {data: pastPeriodInvoiceStatistics} = useInvoiceStatistics(
    {
      ...(filters ?? {}),
      sentDateFrom: pastFrom,
      sentDateTo: pastTo,
    },
    {enabled: !!pastFrom && !!pastTo},
  );

  const currentStatisticsCounts = useMemo(() => {
    const {statusesAmount, statusesCount} = aggregateInvoiceStatistics(
      currentCurrency,
      invoiceStatistics,
    );

    return {statusesCount, statusesAmount};
  }, [invoiceStatistics]);

  const pastStatisticsCounts = useMemo(() => {
    if (!pastFrom || !pastTo) return undefined;

    const {statusesAmount, statusesCount} = aggregateInvoiceStatistics(
      currentCurrency,
      pastPeriodInvoiceStatistics,
    );

    return {statusesCount, statusesAmount};
  }, [pastPeriodInvoiceStatistics]);

  const noOfInvoiceChange = calculatePercentChange(
    pastStatisticsCounts?.statusesCount.total,
    currentStatisticsCounts.statusesCount.total,
  );
  const noOfOverdueInvoiceChange = calculatePercentChange(
    pastStatisticsCounts?.statusesCount.overdue,
    currentStatisticsCounts.statusesCount.overdue,
  );
  const totalAmountInvoiceChange = calculatePercentChange(
    pastStatisticsCounts?.statusesAmount.total,
    currentStatisticsCounts.statusesAmount.total,
  );
  const paidAmountInvoiceChange = calculatePercentChange(
    pastStatisticsCounts?.statusesAmount.paid,
    currentStatisticsCounts.statusesAmount.paid,
  );
  const pendingAmountInvoiceChange = calculatePercentChange(
    pastStatisticsCounts?.statusesAmount.pending,
    currentStatisticsCounts.statusesAmount.pending,
  );

  return (
    <Box>
      <Grid rowGap={4} container>
        <RowItem>
          <Metric
            title="Number of invoices"
            value={currentStatisticsCounts.statusesCount.total}
            icon={<ReceiptDollar fontSize="2rem" style={iconStyles} />}
            changeValue={noOfInvoiceChange}
            tooltipText={t(
              'Total number of invoices from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
              {
                createdDateTimeFrom: formatDate(filters?.sentDateFrom),
                createdDateTimeTo: formatDate(filters?.sentDateTo),
              },
            )}
          />
        </RowItem>
        <Divider
          orientation="vertical"
          flexItem
          style={{borderColor: '#D9D9D9'}}
        />
        <RowItem>
          <Metric
            title="Overdue invoices"
            value={currentStatisticsCounts.statusesCount.overdue}
            icon={<TimeClockFire fontSize="2rem" style={iconStyles} />}
            changeValue={noOfOverdueInvoiceChange}
            tooltipText={t(
              'Total number of overdue invoices from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
              {
                createdDateTimeFrom: formatDate(filters?.sentDateFrom),
                createdDateTimeTo: formatDate(filters?.sentDateTo),
              },
            )}
          />
        </RowItem>
        <Divider
          orientation="vertical"
          flexItem
          style={{borderColor: '#D9D9D9'}}
        />
        <RowItem>
          <Metric
            title="Total value"
            changeValue={totalAmountInvoiceChange}
            value={formatCurrency(
              currentStatisticsCounts.statusesAmount.total /
                10 ** currentCurrency.fractionDigits,
              {
                currencySymbol: currentCurrency.symbol,
              },
            )}
            icon={<DataFileBarsCash fontSize="2rem" style={iconStyles} />}
            tooltipText={t(
              'Total amount of invoices from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
              {
                createdDateTimeFrom: formatDate(filters?.sentDateFrom),
                createdDateTimeTo: formatDate(filters?.sentDateTo),
              },
            )}
          />
        </RowItem>
        <Divider
          orientation="vertical"
          flexItem
          style={{borderColor: '#D9D9D9'}}
        />
        <RowItem>
          <Metric
            title="Paid value"
            changeValue={paidAmountInvoiceChange}
            value={formatCurrency(
              currentStatisticsCounts.statusesAmount.paid /
                10 ** currentCurrency.fractionDigits,
              {
                currencySymbol: currentCurrency.symbol,
              },
            )}
            icon={<CashPaymentCoins fontSize="2rem" style={iconStyles} />}
            tooltipText={t(
              'Total amount of paid invoices from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
              {
                createdDateTimeFrom: formatDate(filters?.sentDateFrom),
                createdDateTimeTo: formatDate(filters?.sentDateTo),
              },
            )}
          />
        </RowItem>
        <Divider
          orientation="vertical"
          flexItem
          style={{borderColor: '#D9D9D9'}}
        />
        <RowItem>
          <Metric
            title="Pending value"
            changeValue={pendingAmountInvoiceChange}
            value={formatCurrency(
              currentStatisticsCounts.statusesAmount.pending /
                10 ** currentCurrency.fractionDigits,
              {
                currencySymbol: currentCurrency.symbol,
              },
            )}
            icon={<TimeClockHand fontSize="2rem" style={iconStyles} />}
            tooltipText={t(
              'Total amount of pending invoices from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
              {
                createdDateTimeFrom: formatDate(filters?.sentDateFrom),
                createdDateTimeTo: formatDate(filters?.sentDateTo),
              },
            )}
          />
        </RowItem>
      </Grid>
    </Box>
  );
};

export default DashboardMetrics;
