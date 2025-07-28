import {Box, Divider, Grid} from '@mui/material';
import Metric from 'components/Metric';
import {ReactComponent as ReceiptDollar} from 'assets/icons/ReceiptDollar.svg';
import {ReactComponent as DataFileBarsCash} from 'assets/icons/DataFileBarsCash.svg';
import {ReactComponent as CashPaymentCoins} from 'assets/icons/CashPaymentCoins.svg';
import {ReactComponent as TimeClockHand} from 'assets/icons/TimeClockHand.svg';
import {useTranslation} from 'react-i18next';
import {formatDate, getPastDateRange} from 'utils/datetime';
import React, {useMemo} from 'react';
import {calculatePercentChange} from 'utils/utils';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {QueryQuotationParams, QuotationStatistics} from 'models/quotation';
import {useQuotationStatistics} from 'hooks/reactQuery/useQuotation';
import {aggregateQuotationStatistics} from 'utils/quotation';

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
  filters?: QueryQuotationParams;
  quotationStatistics?: QuotationStatistics;
};

const DashboardMetrics = ({quotationStatistics, filters}: Props) => {
  const {t} = useTranslation();

  const currentCurrency = useCurrentCurrency();
  const {pastFrom, pastTo} = getPastDateRange(
    filters?.createdDateStart?.toISOString(),
    filters?.createdDateEnd?.toISOString(),
  );

  // Fetch past period statistics, we do not need to fetch current stats because it is already
  // fetched in the component where this is currently used
  const {data: pastPeriodQuotationStatistics} = useQuotationStatistics(
    {
      ...(filters ?? {}),
      createdDateStart: pastFrom ? new Date(pastFrom) : undefined,
      createdDateEnd: pastTo ? new Date(pastTo) : undefined,
    },
    {enabled: !!pastFrom && !!pastTo},
  );

  const currentStatisticsCounts = useMemo(() => {
    const {statusesAmount, statusesCount} = aggregateQuotationStatistics(
      currentCurrency,
      quotationStatistics,
    );

    return {statusesCount, statusesAmount};
  }, [quotationStatistics]);

  const pastStatisticsCounts = useMemo(() => {
    if (!pastFrom || !pastTo) return undefined;

    const {statusesAmount, statusesCount} = aggregateQuotationStatistics(
      currentCurrency,
      pastPeriodQuotationStatistics,
    );

    return {statusesCount, statusesAmount};
  }, [pastPeriodQuotationStatistics]);

  const noOfQuotationChange = calculatePercentChange(
    pastStatisticsCounts?.statusesCount.total,
    currentStatisticsCounts.statusesCount.total,
  );

  const totalValueOfQuotationChange = calculatePercentChange(
    pastStatisticsCounts?.statusesAmount.total,
    currentStatisticsCounts.statusesAmount.total,
  );
  const acceptedValueOfQuotationChange = calculatePercentChange(
    pastStatisticsCounts?.statusesAmount.accepted,
    currentStatisticsCounts.statusesAmount.accepted,
  );
  const pendingValueOfQuotationChange = calculatePercentChange(
    pastStatisticsCounts?.statusesAmount.pending,
    currentStatisticsCounts.statusesAmount.pending,
  );

  return (
    <Box>
      <Grid rowGap={4} container>
        <RowItem>
          <Metric
            title="Number of quotations"
            value={currentStatisticsCounts.statusesCount.total}
            icon={<ReceiptDollar fontSize="2rem" style={iconStyles} />}
            changeValue={noOfQuotationChange}
            tooltipText={t(
              'Total number of quotations from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
              {
                createdDateTimeFrom: formatDate(filters?.createdDateStart),
                createdDateTimeTo: formatDate(filters?.createdDateEnd),
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
            changeValue={totalValueOfQuotationChange}
            value={formatCurrency(
              currentStatisticsCounts.statusesAmount.total /
                10 ** currentCurrency.fractionDigits,
              {
                currency: currentCurrency.code,
              },
            )}
            icon={<DataFileBarsCash fontSize="2rem" style={iconStyles} />}
            tooltipText={t(
              'Total amount of quotations from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
              {
                createdDateTimeFrom: formatDate(filters?.createdDateStart),
                createdDateTimeTo: formatDate(filters?.createdDateEnd),
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
            title="Accepted value"
            changeValue={acceptedValueOfQuotationChange}
            value={formatCurrency(
              currentStatisticsCounts.statusesAmount.accepted /
                10 ** currentCurrency.fractionDigits,
              {
                currency: currentCurrency.code,
              },
            )}
            icon={<CashPaymentCoins fontSize="2rem" style={iconStyles} />}
            tooltipText={t(
              'Total amount of accepted quotations from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
              {
                createdDateTimeFrom: formatDate(filters?.createdDateStart),
                createdDateTimeTo: formatDate(filters?.createdDateEnd),
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
            changeValue={pendingValueOfQuotationChange}
            value={formatCurrency(
              currentStatisticsCounts.statusesAmount.pending /
                10 ** currentCurrency.fractionDigits,
              {
                currency: currentCurrency.code,
              },
            )}
            icon={<TimeClockHand fontSize="2rem" style={iconStyles} />}
            tooltipText={t(
              'Total amount of pending quotations from {{createdDateTimeFrom}} - {{createdDateTimeTo}}',
              {
                createdDateTimeFrom: formatDate(filters?.createdDateStart),
                createdDateTimeTo: formatDate(filters?.createdDateEnd),
              },
            )}
          />
        </RowItem>
      </Grid>
    </Box>
  );
};

export default DashboardMetrics;
