import Box, {BoxProps} from '@mui/material/Box';
import {useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import {SearchInput} from 'components/SearchInput';
import {PageCard} from 'components/PageCard';
import {DatePicker} from 'components/DatePicker';
import {ServiceOrderView} from 'models/service-order';
import {useDueServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {useInView} from 'react-intersection-observer';
import {endOfDay, startOfDay, addDays} from 'date-fns';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {toRestDate} from 'utils/datetime';
import {Resource} from 'models/misc';
import {OrderDetails} from './OrderDetails';

interface Props extends BoxProps {
  containerStyles?: {[key: string]: string | number};
}

export const UnAssignedServiceOrders = ({containerStyles, ...rest}: Props) => {
  const [search, setSearch] = useState('');
  const {ref, inView} = useInView();
  const [page, setPage] = useState(makePage(0, 50));
  const [hasMore, setHasMore] = useState(false);
  const [serviceOrdersView, setServiceOrdersView] = useState<
    Resource<ServiceOrderView>
  >(createEmptyResource<ServiceOrderView>(page.pageSize));
  const [startDate, setStartDate] = useState(
    startOfDay(addDays(new Date(), -90)),
  );
  const [endDate, setEndDate] = useState(endOfDay(addDays(new Date(), 90)));

  const {
    data: serviceOrders = createEmptyResource<ServiceOrderView>(page.pageSize),
    isLoading,
  } = useDueServiceOrders({
    end: toRestDate(endDate),
    start: toRestDate(startDate),
    pageSize: page.pageSize,
    pageIndex: page.pageIndex,
    query: search,
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

  return (
    <Box sx={{...containerStyles}} {...rest}>
      <PageCard
        containerStyles={{height: '100%'}}
        contentContainerStyles={{height: '100%', mx: 0, px: 0, pt: '0.79em'}}
        headerStyles={{
          background: 'none',
          pt: '0.84em',
          pb: 0,
          mx: '0',
          mt: 0,
          height: 'default',
        }}>
        <Box display="flex" flexDirection="column" gap={2} sx={{px: '0.5em'}}>
          <SearchInput
            placeholder="e.g. REWE AG"
            variant="outlined"
            label="Search"
            onValueChanged={(searchValue) => setSearch(searchValue)}
            containerStyle={{
              background: '#fff',
              width: '100%',
            }}
          />
          <Grid container gap={1} justifyContent="space-between">
            <Grid item xs={12} xl={5.7}>
              <DatePicker
                defaultDate={startDate}
                maxDate={endDate}
                getSelectedDate={(date) => date && setStartDate(date)}
                inputLabelProps={{shrink: undefined}}
                textFieldProps={{
                  label: 'Start Date',
                  sx: {background: '#fff'},
                }}
              />
            </Grid>
            <Grid item xs={12} xl={5.7}>
              <DatePicker
                defaultDate={endDate}
                minDate={startDate}
                getSelectedDate={(date) => date && setEndDate(date)}
                inputLabelProps={{shrink: undefined}}
                textFieldProps={{
                  label: 'End Date',
                  sx: {background: '#fff'},
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{mt: '1em'}} />
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
