import Box, {BoxProps} from '@mui/material/Box';
import React, {useState} from 'react';
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
import {endOfDay, startOfMonth} from 'date-fns';
import {createEmptyResource} from 'utils/paging-utils';
import {Order} from 'models/misc';
import {OrderDetails} from './OrderDetails';

const pageSize = 50;

interface Props extends BoxProps {
  containerStyles?: {[key: string]: string | number};
}

export const UnAssignedServiceOrders = ({containerStyles, ...rest}: Props) => {
  const [search, setSearch] = useState('');
  const {
    data: serviceOrders = createEmptyResource<ServiceOrderView>(pageSize),
  } = useServiceOrders({
    end: endOfDay(new Date()).toISOString(),
    start: startOfMonth(new Date()).toISOString(), // we should show unsassigned orders for a couople month
    pageSize,
    pageIndex: 0,
    query: search,
    status: [ServiceOrderStatus.READY_TO_SCHEDULE, ServiceOrderStatus.INIT],
    order: Order.ASC,
    orderBy: ServiceOrderOrderField.CREATED_TIME,
  });

  return (
    <Box sx={{...containerStyles}} {...rest}>
      <PageCard
        containerStyles={{height: '100%'}}
        contentContainerStyles={{height: '100%', mx: 0, px: 0, pt: '0.4em'}}
        customHeader={
          <Typography sx={{}} variant="subtitle2" color="textSecondary">
            Unassigned Orders (12)
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
            size="small"
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
          {serviceOrders.data.map((serviceOrder) => (
            <OrderDetails serviceOrder={serviceOrder} />
          ))}
        </Box>
      </PageCard>
    </Box>
  );
};
