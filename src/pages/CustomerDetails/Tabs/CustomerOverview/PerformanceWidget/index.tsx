import {PropertyOwnerView} from 'models/propertyManager';
import React, {useEffect, useState} from 'react';
import {ReactComponent as GaugeDashboard} from 'assets/illustrations/GaugeDashboard.svg';
import {ReactComponent as AccountingBills} from 'assets/illustrations/AccountingBills.svg';
import {ReactComponent as UnionIcon} from 'assets/icons/union.svg';
import {ReactComponent as LiftIcon} from 'assets/icons/LiftIcon.svg';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {Box, Grid2 as Grid, Tooltip, Typography} from '@mui/material';
import {t} from 'i18next';
import DatePickerRange from 'components/DatePickerRange';
import {DateRange} from '@mui/x-date-pickers-pro';
import {endOfDay, startOfDay, subYears} from 'date-fns';
import {CalendarTodayOutlined} from '@mui/icons-material';
import {formatDate, getDateObject} from 'utils/datetime';
import {useUseQueryCustomerStatistics} from 'hooks/reactQuery/useCustomers';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';

type Props = {
  customer: PropertyOwnerView;
};

const PerformanceCard = ({
  title,
  icon: Icon,
  value,
  tooltipText,
  align = 'left',
}: {
  title: string;
  icon: React.ElementType;
  value: string | number;
  tooltipText: string;
  align?: 'left' | 'center' | 'right';
}) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems={
      align === 'center'
        ? 'center'
        : align === 'right'
        ? 'flex-end'
        : 'flex-start'
    }
    textAlign={align}
    sx={{
      pt: 1,
      bgcolor: 'background.paper',
      borderLeft: align === 'center' ? '1px solid #222B451F' : 'none',
      borderRight: align === 'center' ? '1px solid #222B451F' : 'none',
    }}>
    <Box>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Typography
          variant="body2"
          mt={1}
          color="text.secondary"
          fontWeight="600">
          {title}
        </Typography>
        <Tooltip title={t(tooltipText)} placement="top" arrow>
          <Box sx={{ml: 0.5, mb: -1.8, cursor: 'pointer'}}>
            <AlertInfoIcon width="16px" height="16px" />
          </Box>
        </Tooltip>
      </Box>

      <Box sx={{display: 'flex', alignItems: 'center', mt: 1}}>
        <Icon width={32} height={32} color="#828DA3" />
        <Typography variant="h4" color="primary.dark" ml={1.5} mt={0.3}>
          {value}
        </Typography>
      </Box>
    </Box>
  </Box>
);

const PerformanceWidget = ({customer}: Props) => {
  const currentCurrency = useCurrentCurrency();

  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange<Date | null>
  >([null, null]);

  const [startDate, endDate] = selectedDateRange;

  const formattedStartDate = startDate
    ? startOfDay(startDate).toISOString().split('T')[0]
    : null;

  const formattedEndDate = endDate
    ? endOfDay(endDate).toISOString().split('T')[0]
    : null;

  const {data: customerStats} = useUseQueryCustomerStatistics(customer.id, {
    startDate: formattedStartDate!,
    endDate: formattedEndDate!,
  });

  const totalRevenue = customerStats?.totalRevenue
    ? formatCurrency(
        customerStats?.totalRevenue ?? 0 / 10 ** currentCurrency.fractionDigits,
      )
    : '-';

  const numberOfJobs = customerStats?.numberOfServiceOrders ?? 0;

  const handleDateSelection = (dateValues: DateRange<Date>) => {
    setSelectedDateRange(dateValues);
  };

  useEffect(() => {
    if (!selectedDateRange[0] || !selectedDateRange[1]) {
      const today = new Date();
      const oneYearAgo = subYears(today, 1);
      setSelectedDateRange([oneYearAgo, today]);
    }
  }, []);

  return (
    <Box bgcolor="white" p={3} borderRadius={1}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pb={1.5}>
        <Box display="flex" alignItems="center">
          <GaugeDashboard fontSize="1.5rem" color="#828DA3" />
          <Typography variant="h5" color="primary.dark" sx={{ml: 1.5}}>
            {t('Performance')}
          </Typography>
        </Box>
        <DatePickerRange
          defaultDate={selectedDateRange}
          getSelectedDate={handleDateSelection}
          textFieldProps={{
            label: '',
            sx: {
              width: '100%',
            },
          }}
          onClear={() => setSelectedDateRange([null, null])}
          sx={{width: '300px', paddingTop: 0}}
          inputTestId="start-end-date"
          popupTestId="start-end-date-popup"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 3.5}}>
          <PerformanceCard
            title={t('Total revenue')}
            icon={AccountingBills}
            value={totalRevenue}
            align="left"
            tooltipText={t(
              `Total net revenue of all invoices sent from {{startDate}} to {{endDate}}. Draft invoices won't be counted.`,
              {
                startDate: formatDate(startDate!),
                endDate: formatDate(endDate!),
              },
            )}
          />
        </Grid>

        <Grid size={{xs: 12, md: 5}}>
          <PerformanceCard
            title={t('Number of jobs')}
            icon={UnionIcon}
            value={numberOfJobs || '-'}
            align="center"
            tooltipText={t(
              'Total number of all jobs completed from {{startDate}} to {{endDate}}. Cancelled & archived jobs won’t be counted.',
              {
                startDate: formatDate(startDate!),
                endDate: formatDate(endDate!),
              },
            )}
          />
        </Grid>

        <Grid size={{xs: 12, md: 3.5}}>
          <PerformanceCard
            title={t('Number of units')}
            icon={LiftIcon}
            value={customer.unitNumber || '-'}
            align="right"
            tooltipText={t(
              'Total number of units between {{startDate}} to {{endDate}}. Archived units won’t be counted.',
              {
                startDate: formatDate(startDate!),
                endDate: formatDate(endDate!),
              },
            )}
          />
        </Grid>
      </Grid>

      {formatDate(getDateObject(customer.additionalInfo.registrationDate)) && (
        <Grid size={{xs: 12, md: 3.5}}>
          <Box sx={{display: 'flex', alignItems: 'center', pt: 2}}>
            <CalendarTodayOutlined color="disabled" />
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight="600"
              pl={1}>
              {`${t('Customer since')} : `}
            </Typography>
            <Typography
              variant="body2"
              color="primary"
              fontWeight="600"
              pl={0.5}>
              {(formatDate(
                getDateObject(customer.additionalInfo.registrationDate),
              ) as string) || '-'}
            </Typography>
          </Box>
        </Grid>
      )}
    </Box>
  );
};

export default PerformanceWidget;
