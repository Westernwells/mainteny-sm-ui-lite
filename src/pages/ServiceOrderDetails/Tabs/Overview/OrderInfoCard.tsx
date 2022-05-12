import {useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {BasicDetailsCard} from 'components/BasicDetailsCard';
import EditIcon from '@mui/icons-material/Edit';
import useTheme from '@mui/material/styles/useTheme';
import Button from '@mui/material/Button';
import {convertToText} from 'utils/utils';
import {CardProps} from 'components/CardProps';
import {Confirm} from 'components/Confirm';
import {
  useCancelServiceOrders,
  useUnscheduleServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrder, ServiceOrderStatus} from 'models/service-order';
import {orderInfo as orderInfoSchema} from './schema';

interface Props {
  serviceOrderDetails: ServiceOrder;
}

export const OrderInfoCard = ({serviceOrderDetails}: Props) => {
  const theme = useTheme();
  const orderInfo = useRef(orderInfoSchema(serviceOrderDetails)).current;
  const {mutate: cancelServiceOrder} = useCancelServiceOrders();
  const {mutate: unscheduleServiceOrder} = useUnscheduleServiceOrders();
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [openUnscheduleConfirm, setOpenUnscheduleConfirm] = useState(false);

  const renderRescheduleUnassignBtnGroup = () =>
    [ServiceOrderStatus.SCHEDULED, ServiceOrderStatus.IN_PROGRESS].includes(
      serviceOrderDetails.status,
    ) ? (
      <>
        <Button
          variant="contained"
          size="small"
          sx={{px: '2.5em', mt: '1em', mr: '1em'}}>
          Reschedule
        </Button>
        <Button
          variant="outlined"
          size="small"
          sx={{px: '2.5em', mt: '1em'}}
          onClick={() => setOpenUnscheduleConfirm(true)}>
          Unschedule
        </Button>
      </>
    ) : null;

  const renderCancelScheduleBtnGroup = () =>
    [
      ServiceOrderStatus.INIT,
      ServiceOrderStatus.READY_TO_SCHEDULE,
      ServiceOrderStatus.SCHEDULING,
    ].includes(serviceOrderDetails.status) ? (
      <>
        <Button
          variant="text"
          size="small"
          sx={{px: '2.5em', mt: '1em'}}
          onClick={() => setOpenCancelConfirm(true)}>
          Cancel
        </Button>
        <Button variant="contained" size="small" sx={{px: '2.5em', mt: '1em'}}>
          Schedule
        </Button>
      </>
    ) : null;

  return (
    <BasicDetailsCard
      containerStyles={{display: 'flex', flexDirection: 'column'}}
      header={
        <Box>
          <Typography variant="subtitle1">
            {serviceOrderDetails.number}
          </Typography>
          <Box sx={{display: 'flex'}}>
            <Typography variant="body2" sx={{mr: '0.2em'}}>
              {serviceOrderDetails.description}
            </Typography>
            <EditIcon
              style={{color: theme.palette.text.secondary}}
              fontSize="small"
            />
          </Box>
        </Box>
      }>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}>
        {Object.values(orderInfo).map((item, index) => (
          <CardProps
            key={`${index}`}
            label={item.label}
            icon={item.icon}
            bodyText={convertToText(item.value!)}
            containerStyles={{mb: '0.5em', width: '27%'}}
            iconMaxHeight="3rem"
            iconBackground={theme.palette.info.outlinedHoverBg}
          />
        ))}
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
        {renderCancelScheduleBtnGroup()}
        {renderRescheduleUnassignBtnGroup()}
      </Box>
      <Confirm
        open={openCancelConfirm}
        onConfirm={() => {
          cancelServiceOrder(serviceOrderDetails.id);
          setOpenCancelConfirm(false);
        }}
        onClose={() => setOpenCancelConfirm(false)}
        title="Confirm"
        content="Do you want to cancel the service order?"
      />
      <Confirm
        open={openUnscheduleConfirm}
        onConfirm={() => {
          unscheduleServiceOrder(serviceOrderDetails.id);
          setOpenUnscheduleConfirm(false);
        }}
        onClose={() => setOpenUnscheduleConfirm(false)}
        title="Confirm"
        content="Do you want to unschedule the service order?"
      />
    </BasicDetailsCard>
  );
};
