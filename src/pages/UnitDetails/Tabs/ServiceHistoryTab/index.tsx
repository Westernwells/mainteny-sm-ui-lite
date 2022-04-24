import {useCallback, useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import {EmptyIllustration} from 'components/EmptyIllustration';
import HideImageIcon from '@mui/icons-material/HideImage';
import useTheme from '@mui/material/styles/useTheme';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import {EmptySection} from 'components/EmptySection';
import {SplitButton} from 'components/SplitButton';
import Box from '@mui/material/Box';
import {PageCard} from 'components/PageCard';
import {createEmptyResource} from 'utils/paging-utils';
import {
  useServiceOrderReport,
  useServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {formatDate, getDateObject} from 'utils/datetime';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useElevatorById} from 'hooks/reactQuery/useElevator';
import {getYear, eachYearOfInterval, endOfYear, startOfYear} from 'date-fns';
import {useParams} from 'react-router-dom';
import {HistoryCard} from './HistoryCard';
import {HistoryReport} from './HistoryReport';
import {HistoryBasicDetails} from './HistoryBasicDetails';
import {HistoryAttachments} from './HistoryAttachments';

const pageSize = 10;

export const ServiceHistoryTab = () => {
  const theme = useTheme();
  const {id: elevatorId} = useParams();
  const [selectedYear, setSelectedYear] = useState(
    getYear(new Date()).toString(),
  );
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedStatusView, setSelectedStatusView] = useState('All');
  const [isEmpty, setIsEmpty] = useState<boolean>(false);

  const [expanded, setExpanded] = useState<boolean>();
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrderView>();
  const [currentReportDate, setCurrentReportDate] = useState<string>();
  const [currentScheduleDate, setCurrentScheduleDate] = useState<string | null>(
    null,
  );
  const [currentScheduleTime, setCurrentScheduleTime] = useState<string | null>(
    null,
  );
  const {
    data: totalServiceOrders = createEmptyResource<ServiceOrderView>(100),
  } = useServiceOrders({
    elevatorIds: elevatorId,
    start: startOfYear(new Date('2000')).toISOString(),
    end: endOfYear(new Date(getYear(new Date()).toString())).toISOString(),
    pageSize: 1,
    // pageIndex: 0,
    query: '',
    status: [
      ServiceOrderStatus.SCHEDULED,
      ServiceOrderStatus.COMPLETED,
      ServiceOrderStatus.IN_PROGRESS,
    ],
  });
  const {
    data: serviceOrders = createEmptyResource<ServiceOrderView>(pageSize),
  } = useServiceOrders({
    elevatorIds: elevatorId,
    start: startOfYear(new Date(selectedYear)).toISOString(),
    end: endOfYear(new Date(selectedYear)).toISOString(),
    pageSize: 50,
    pageIndex: 0,
    query: '',
    status: selectedStatus.length || [
      ServiceOrderStatus.SCHEDULED,
      ServiceOrderStatus.COMPLETED,
      ServiceOrderStatus.IN_PROGRESS,
    ],
  });
  const {data: serviceOrderReport = [], isLoading: serviceOrderReportLoading} =
    useServiceOrderReport({
      serviceOrderId: selectedOrder?.id || '',
    });

  const {data: downloadUrl} = useDownloadUrl(
    serviceOrderReport.length
      ? serviceOrderReport[0].attachments.map((item) => item.fileResource.uri)
      : [],
    {cacheTime: 5000, refetchOnWindowFocus: true},
  );

  const {data: elevator} = useElevatorById(elevatorId);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const resolveScheduledDate = () =>
    formatDate(selectedOrder?.schedules[0].startTime, 'dd MMM YYY') || null;

  const resolveScheduledTime = () => {
    const startTime = formatDate(selectedOrder?.schedules[0].startTime, 'ha');
    const endTime = formatDate(selectedOrder?.schedules[0].endTime, 'ha');

    return startTime && endTime ? `${startTime} - ${endTime}` : null;
  };

  useEffect(() => {
    const date = formatDate(
      getDateObject(selectedOrder?.actualEndTime),
      'dd MMM YYY',
    );
    const result = date && `Resolved on ${date}`;
    setCurrentReportDate(result);
    setCurrentScheduleDate(resolveScheduledDate());
    setCurrentScheduleTime(resolveScheduledTime());
  }, [selectedOrder]);

  useEffect(() => {
    if (serviceOrders) {
      setSelectedOrder(serviceOrders.data[0]);
    }
    setIsEmpty(serviceOrders.data.length === 0);
  }, [serviceOrders]);

  const getYears = useCallback(() => {
    let yrs: string[] = [];
    if (elevator) {
      const startDate = getDateObject(elevator.meta.createdAt);
      const currentDate = new Date();
      const result = eachYearOfInterval({
        start: startDate,
        end: currentDate,
      });
      yrs = result.map((date) => getYear(date).toString());
    }

    return yrs;
  }, [serviceOrders]);

  const getStatus = useCallback(
    () =>
      Object.keys(ServiceOrderStatus)
        .map((item) => {
          if (item === ServiceOrderStatus.SCHEDULED) {
            return 'Pending';
          }

          if (item === ServiceOrderStatus.ALL) {
            return 'All';
          }

          if (
            item === ServiceOrderStatus.IN_PROGRESS ||
            item === ServiceOrderStatus.COMPLETED
          ) {
            return item.split('_').join(' ').toLowerCase();
          }

          return null;
        })
        .filter((x): x is string => !!x),
    [],
  );

  const onStatusSelect = (value: string) => {
    setSelectedStatusView(value);
    if (value !== 'All') {
      if (value === 'Pending') {
        return setSelectedStatus([ServiceOrderStatus.SCHEDULED]);
      }
      return setSelectedStatus([value.split(' ').join('_').toUpperCase()]);
      // return setSelectedStatus([...selectedStatus, value]);
    }
    return setSelectedStatus([]);
  };

  const resetFilters = () => {
    setSelectedYear(getYear(new Date()).toString());
    setSelectedStatus([]);
    setSelectedStatusView('All');
  };

  if (!totalServiceOrders.total) {
    return (
      <EmptySection
        label="No service history entries made so far!"
        size="large"
        containerStyle={{mt: 12}}
      />
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
        {isEmpty ? (
          <PageCard minHeight="100%">
            <EmptySection
              label="No service history entries for the applied filters!"
              containerStyle={{mt: 12}}
            />
          </PageCard>
        ) : (
          <>
            <HistoryBasicDetails>
              <HistoryCard
                showTimeCategory
                // noContent={!selectedOrder}
                serviceOrder={selectedOrder}
                headerTitle={currentScheduleDate || null}
                description={selectedOrder?.description}
                scheduledTime={
                  currentScheduleDate && currentScheduleTime
                    ? `${currentScheduleDate}, ${currentScheduleTime}`
                    : ''
                }
                minHeight="30vh"
                isDetailCard
                removeBottomLeftRadius
                removeBottomRightRadius
                showAlert
                headerActionIcon={<MoreVertIcon />}
                subtitle={currentScheduleTime || null}
                containerStyles={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                  pt: '0.5em',
                }}
              />
            </HistoryBasicDetails>
            <HistoryReport>
              <HistoryCard
                serviceOrder={selectedOrder}
                noContent={!serviceOrderReport.length}
                serviceOrderReport={serviceOrderReport[0]}
                reportIsLoading={serviceOrderReportLoading}
                minHeight="30vh"
                isDetailCard
                removeTopLeftRadius
                removeTopRightRadius
                removeServiceOrderType
                removeServiceOrderStatus
                showMoreReportDetails={!!serviceOrderReport.length}
                showActionSection
                containerStyles={{
                  pt: '0.5em',
                }}
                handleExpandClick={handleExpandClick}
                expanded={expanded}
                collapsedChildren={
                  downloadUrl?.length ? (
                    <HistoryAttachments downloadUrl={downloadUrl} />
                  ) : (
                    <EmptyIllustration
                      label="No image attachments are added to the work report!"
                      labelStyle={{
                        mt: '1em',
                        color: theme.palette.text.secondary,
                      }}
                      labelVariant="subtitle2"
                      icon={
                        <HideImageIcon
                          color="primary"
                          sx={{width: '2.875rem', height: '2.875rem'}}
                        />
                      }
                    />
                  )
                }
                headerTitle="Work Report"
                subtitle={currentReportDate || 'Awaiting completion of visit'}
              />
            </HistoryReport>
          </>
        )}
      </Grid>
      <Grid item xs={4}>
        <PageCard
          headerLabel="All Services"
          contentContainerStyles={{p: 0, mx: 0}}
          headerContainerOverrideStyles={{
            background: 'none',
            mt: 'default',
            mx: 'default',
            height: 'default',
          }}
          headerActionIcon={<MoreVertIcon />}>
          <Box display="flex" mb="0.8em" px="1rem">
            <Box mr="1em">
              <SplitButton
                variant="outlined"
                size="small"
                disableRipple
                selectionStyle={{background: '#fff', cursor: 'default'}}
                selectedOption={`Year: ${selectedYear}`}
                options={getYears()}
                onSelectedOptionChanged={(value) => setSelectedYear(value)}
              />
            </Box>
            <SplitButton
              variant="outlined"
              size="small"
              disableRipple
              selectionStyle={{background: '#fff', cursor: 'default'}}
              selectedOption={`Status: ${selectedStatusView}`}
              options={getStatus()}
              onSelectedOptionChanged={onStatusSelect}
            />
          </Box>
          {isEmpty ? (
            <Box
              sx={{height: '55vh'}}
              display="flex"
              flexDirection="column"
              alignItems="center">
              <EmptySection
                label="No service history entries for the applied filters!"
                illustration="clipboard"
                size="small"
                containerStyle={{mt: 8, mb: 2}}
              />
              <Button variant="contained" onClick={resetFilters}>
                Reset Filters
              </Button>
            </Box>
          ) : (
            <Box sx={{height: '55vh', overflowY: 'scroll'}}>
              {serviceOrders.data.map((serviceOrder: ServiceOrderView) => (
                <HistoryCard
                  serviceOrder={serviceOrder}
                  headerTitle={formatDate(
                    serviceOrder.schedules[0].startTime,
                    'dd MMM YYY',
                  )}
                  subtitle={`${formatDate(
                    serviceOrder?.schedules[0].startTime,
                    'ha',
                  )} - ${formatDate(serviceOrder?.schedules[0].endTime, 'ha')}`}
                  description={serviceOrder.description}
                  key={serviceOrder.id}
                  selected={serviceOrder.id === selectedOrder?.id}
                  onCardSelect={() => setSelectedOrder(serviceOrder)}
                  containerStyles={{borderRadius: 0}}
                  showPointer
                  removeShadows
                  bodyContainerStyle={{
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                  }}
                />
              ))}
            </Box>
          )}
        </PageCard>
      </Grid>
    </Grid>
  );
};
