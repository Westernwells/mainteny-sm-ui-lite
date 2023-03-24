import {useLocation} from 'react-router-dom';
import queryString from 'query-string';
import Box from '@mui/material/Box';
import {Progress} from 'components/Progress';
import {useServiceOrderDetails} from 'hooks/reactQuery/useServiceOrder';
import {InvoiceForm} from './InvoiceForm';

export const NewInvoice = () => {
  const {search} = useLocation();

  const {orderId} = queryString.parse(search);

  const {data: serviceOrderDetails, isLoading} =
    typeof orderId === 'string'
      ? useServiceOrderDetails(orderId)
      : {data: undefined, isLoading: false};

  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}>
        <Progress height="100%" />
      </Box>
    );
  }
  return <InvoiceForm serviceOrderResource={serviceOrderDetails} />;
};

export default NewInvoice;
