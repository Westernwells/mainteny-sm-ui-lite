import Box, {BoxProps} from '@mui/material/Box';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {DateRange} from '@mui/x-date-pickers-pro';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import {SearchInput} from 'components/SearchInput';
import {PageCard} from 'components/PageCard';
import DatePickerRange from 'components/DatePickerRange';
import {ServiceOrderView} from 'models/service-order';
import {useDueServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {useQueryState} from 'hooks/useQueryState';
import {useInView} from 'react-intersection-observer';
import {endOfDay, startOfDay, addDays} from 'date-fns';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {toRestDate} from 'utils/datetime';
import {ReactComponent as Layout} from 'assets/icons/Layout.svg';
import {ReactComponent as FilterIcon} from 'assets/icons/FilterIcon.svg';
import {Order, Resource} from 'models/misc';
import {OrderDetails} from './OrderDetails';

interface Props extends BoxProps {
  containerStyles?: {[key: string]: string | number};
}

export const UnAssignedServiceOrders = ({containerStyles, ...rest}: Props) => {
  const {t} = useTranslation();
  const [search, setSearch] = useQueryState('searchServiceOrders');
  const {ref, inView} = useInView();
  const [page, setPage] = useState(makePage(0, 50));
  const [hasMore, setHasMore] = useState(false);
  const [serviceOrdersView, setServiceOrdersView] = useState<
    Resource<ServiceOrderView>
  >(createEmptyResource<ServiceOrderView>(page.pageSize));
  const [selectedDateRange, setSelectedDateRange] = useQueryState<
    DateRange<Date | null>
  >('dateRange', {
    defaultValue: [null, null],
  });
  const startDate = selectedDateRange[0]
    ? new Date(selectedDateRange[0])
    : startOfDay(addDays(new Date(), -90));
  const endDate = selectedDateRange[1]
    ? new Date(selectedDateRange[1])
    : endOfDay(addDays(new Date(), 90));
  const [order, setOrder] = useQueryState('order', {defaultValue: Order.DESC});

  const {
    data: serviceOrders = createEmptyResource<ServiceOrderView>(page.pageSize),
    isLoading,
  } = useDueServiceOrders({
    end: toRestDate(endDate),
    start: toRestDate(startDate),
    pageSize: page.pageSize,
    pageIndex: page.pageIndex,
    query: search,
    order,
    candidateTechnicianAssigned: false,
  });

  useEffect(() => {
    if (inView) {
      const currentTotal =
        (serviceOrders.page.pageIndex + 1) * serviceOrders.page.pageSize;
      if (currentTotal < serviceOrders.total) {
        setHasMore(true);
        setPage({...page, pageIndex: serviceOrders.page.pageIndex + 1});
      } else {
        setHasMore(false);
      }
    }
  }, [inView]);

  useEffect(() => {
    if (search) {
      if (page.pageIndex) {
        setPage({...page, pageIndex: 0});
      }
    }
  }, [search]);

  useEffect(() => {
    if (!isLoading) {
      if (page.pageIndex === 0) {
        setServiceOrdersView(serviceOrders);
      } else {
        setServiceOrdersView({
          ...serviceOrders,
          data: [...serviceOrdersView.data, ...serviceOrders.data],
        });
      }
    }
  }, [serviceOrders, isLoading]);

  const handleDateSelection = (dateValues: DateRange<Date>) => {
    setSelectedDateRange(dateValues);
  };

  const handleSort = () => {
    if (order === Order.ASC) {
      setOrder(Order.DESC);
    } else {
      setOrder(Order.ASC);
    }
  };

  return (
    <Box sx={{...containerStyles}} {...rest}>
      <PageCard
        containerStyles={{height: '100%'}}
        contentContainerStyles={{height: '90%', mx: 0, px: 0, pt: '0.79em'}}
        headerStyles={{m: 0}}
        headerLabel="Assign engineers"
        headerIcon={<Layout fontSize={24} />}>
        <Box display="flex" flexDirection="column" gap={2} sx={{px: '0.5em'}}>
          <Box display="flex">
            <SearchInput
              placeholder="e.g. REWE AG"
              variant="outlined"
              label="Search"
              defaultValue={search}
              onValueChanged={(searchValue) => setSearch(searchValue)}
              containerStyle={{
                background: '#fff',
                width: '100%',
              }}
            />
          </Box>
          <DatePickerRange
            defaultDate={selectedDateRange}
            getSelectedDate={(newValue) => {
              handleDateSelection(newValue);
            }}
            textFieldProps={{
              label: t('Date range'),
            }}
            onClear={() => setSelectedDateRange([null, null])}
          />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={1}>
            <Typography variant="body2" color="text.secondary">
              {t('JOB TYPE')}
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {t('DUE IN')}
              </Typography>
              <IconButton
                onClick={handleSort}
                sx={{
                  rotate: order === Order.ASC ? '180deg' : '360deg',
                }}>
                <FilterIcon fontSize="0.9rem" />
              </IconButton>
            </Box>
          </Box>
        </Box>
        <Divider sx={{mt: '0.5rem', mx: 2}} />
        <Box
          sx={{
            overflowY: 'scroll',
            height: '82%',
            '&::-webkit-scrollbar': {
              width: '0.2em',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '100vw',
              marginInline: '0.5em',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '100vw',
              height: '1em',
            },
          }}>
          {serviceOrdersView.data.map((serviceOrder) => (
            <Box ref={ref} key={serviceOrder.id}>
              <OrderDetails serviceOrder={serviceOrder} />
            </Box>
          ))}

          {page.pageIndex > 0 && hasMore ? (
            <Typography variant="smallBtnText"> Loading more... </Typography>
          ) : null}
        </Box>
      </PageCard>
    </Box>
  );
};
