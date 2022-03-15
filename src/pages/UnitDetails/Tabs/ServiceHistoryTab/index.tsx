import {useCallback, useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import MoreVertIcon from '@mui/icons-material/MoreVert';

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
import {startOfDay, getYear, eachYearOfInterval, endOfYear} from 'date-fns';
import {useParams} from 'react-router-dom';
import {HistoryCard} from './HistoryCard';
import {HistoryReport} from './HistoryReport';
import {HistoryBasicDetails} from './HistoryBasicDetails';
import {HistoryAttachments} from './HistoryAttachments';

const pageSize = 10;

export const ServiceHistoryTab = () => {
  const {id: elevatorId} = useParams();
  const [selectedYear, setSelectedYear] = useState(
    getYear(new Date()).toString(),
  );
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedStatusView, setSelectedStatusView] = useState('All');

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
    data: serviceOrders = createEmptyResource<ServiceOrderView>(pageSize),
  } = useServiceOrders({
    elevatorIds: elevatorId,
    start: startOfDay(new Date(selectedYear)).toISOString(),
    end: endOfYear(new Date(selectedYear)).toISOString(),
    pageSize: 50,
    pageIndex: 0,
    query: '',
    status: selectedStatus.length || [
      ServiceOrderStatus.SCHEDULED,
      ServiceOrderStatus.COMPLETED,
      ServiceOrderStatus.IN_PROGRESS,
    ],
  }); // TODO: Use Infinite scroll
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

  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
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
            showMoreSection
            containerStyles={{
              pt: '0.5em',
            }}
            handleExpandClick={handleExpandClick}
            expanded={expanded}
            collapsedChildren={<HistoryAttachments downloadUrl={downloadUrl} />}
            headerTitle="Work Report"
            subtitle={currentReportDate || 'Awaiting completion of visit'}
          />
        </HistoryReport>
      </Grid>
      <Grid item xs={4}>
        <PageCard
          headerLabel="All Services"
          contentPadding="0rem"
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
        </PageCard>
      </Grid>
    </Grid>
  );
};
