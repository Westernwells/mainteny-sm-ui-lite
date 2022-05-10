import React, {useRef} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {BasicDetailsCard} from 'components/BasicDetailsCard';
import EditIcon from '@mui/icons-material/Edit';
import useTheme from '@mui/material/styles/useTheme';
import Button from '@mui/material/Button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {convertToText} from 'utils/utils';
import {CardProps} from 'components/CardProps';
import {ServiceOrder, ServiceOrderStatus} from 'models/service-order';
import {orderInfo as orderInfoSchema} from './schema';

interface Props {
  serviceOrderDetails: ServiceOrder;
}

export const OrderInfoCard = ({serviceOrderDetails}: Props) => {
  const theme = useTheme();
  const orderInfo = useRef(orderInfoSchema(serviceOrderDetails)).current;

  const renderRescheduleUnassignBtnGroup = () =>
    [ServiceOrderStatus.SCHEDULED, ServiceOrderStatus.IN_PROGRESS].includes(
      serviceOrderDetails.status,
    ) ? (
      <>
        <Button
          variant="contained"
          size="small"
          sx={{px: '2.5em', mt: '1em', mr: '1em'}}>
          Rescheduled
        </Button>
        <Button variant="outlined" size="small" sx={{px: '2.5em', mt: '1em'}}>
          Unscheduled
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
        {' '}
        <Button variant="text" size="small" sx={{px: '2.5em', mt: '1em'}}>
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
    </BasicDetailsCard>
  );
};
