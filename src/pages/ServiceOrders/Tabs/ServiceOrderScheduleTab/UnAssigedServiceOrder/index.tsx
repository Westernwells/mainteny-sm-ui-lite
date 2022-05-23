import Box, {BoxProps} from '@mui/material/Box';
import {useEffect, useState} from 'react';
import Typography from '@mui/material/Typography';
import {SearchInput} from 'components/SearchInput';
import {PageCard} from 'components/PageCard';
import Divider from '@mui/material/Divider';
import {
  ServiceOrderOrderField,
  ServiceOrderStatus,
  ServiceOrderView,
} from 'models/service-order';
import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {useInView} from 'react-intersection-observer';
import {endOfDay, startOfMonth} from 'date-fns';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {Order, Resource} from 'models/misc';
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

  const {
    data: serviceOrders = createEmptyResource<ServiceOrderView>(page.pageSize),
  } = useServiceOrders({
    end: endOfDay(new Date()).toISOString(),
    start: startOfMonth(new Date()).toISOString(), // we should show unsassigned orders for a couople month
    pageSize: page.pageSize,
    pageIndex: page.pageIndex,
    query: search,
    status: [ServiceOrderStatus.READY_TO_SCHEDULE, ServiceOrderStatus.INIT],
    order: Order.ASC,
    orderBy: ServiceOrderOrderField.CREATED_TIME,
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
    if (page.pageIndex === 0) {
      setServiceOrdersView(serviceOrders);
    } else {
      setServiceOrdersView({
        ...serviceOrders,
        data: [...serviceOrdersView.data, ...serviceOrders.data],
      });
    }
  }, [serviceOrders]);

  return (
    <Box sx={{...containerStyles}} {...rest}>
      <PageCard
        containerStyles={{height: '100%'}}
        contentContainerStyles={{height: '100%', mx: 0, px: 0, pt: '0.4em'}}
        customHeader={
          <Typography sx={{}} variant="subtitle2" color="textSecondary">
            Unassigned Orders ({serviceOrders.total})
          </Typography>
        }
        headerContainerOverrideStyles={{
          background: 'none',
          pb: 0,
          mx: '0',
          height: 'default',
        }}>
        <Box sx={{px: '0.5em'}}>
          <SearchInput
            placeholder="Search Unassigned Orders"
            onValueChanged={(searchValue) => setSearch(searchValue)}
            containerStyle={{
              background: '#fff',
              width: '100%',
            }}
          />
        </Box>
        <Divider sx={{mt: '1em'}} />
        <Box
          sx={{
            overflowY: 'scroll',
            height: '85%',
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
