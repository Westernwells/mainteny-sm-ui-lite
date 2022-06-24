import Box, {BoxProps} from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderType, ServiceOrderView} from 'models/service-order';
import {Button} from 'components/Button';
import {formatDistance} from 'date-fns';
import Divider from '@mui/material/Divider';
import {useTranslation} from 'react-i18next';
import {serviceOrderTypeToString} from 'utils/service-order-utils';

interface Props extends BoxProps {
  serviceOrder: ServiceOrderView;
}

export const OrderDetails = ({serviceOrder, ...rest}: Props) => {
  const {t} = useTranslation();
  const formatDate = (date: string | number | Date) => {
    const formattedDate: string = formatDistance(new Date(date), new Date());

    const splitDate: string[] = formattedDate.split(' ');

    if (splitDate[0] === 'about') {
      const finalDate: string = t(`${splitDate[0]} {{hours}} ${splitDate[2]}`, {
        hours: splitDate[1],
      });
      return finalDate;
    }

    const finalDate: string = t(`{{time}} ${splitDate[1]}`, {
      time: splitDate[0],
    });
    return finalDate;
  };

  return (
    <Box sx={{mt: '0.5em', px: '0.5em'}} {...rest}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <Box sx={{display: 'flex'}}>
          <ServiceOrderIcons
            serviceOrderType={serviceOrder.type}
            style={{width: '1.14rem', height: '1.02rem', mt: '0.1em'}}
          />
          <Typography
            variant="smallBtnText"
            color={
              serviceOrder.type === ServiceOrderType.EMERGENCY
                ? 'error'
                : 'primary'
            }
            sx={{textTransform: 'capitalize', ml: '0.5em'}}>
            {t(serviceOrderTypeToString(serviceOrder.type))}
          </Typography>
        </Box>
        <Typography variant="caption">
          {t('Due in')} {formatDate(serviceOrder.dueDate)}
          {/* {formatDistance(new Date(serviceOrder.dueDate), new Date()).split(" ")[0]==="about"? t(formatDistance(new Date(serviceOrder.dueDate), new Date()), {hours: formatDistance(new Date(serviceOrder.dueDate), new Date()).split("")[0]}):"hi"} */}
        </Typography>
      </Box>
      <Typography variant="body2" component="div" mt="0.5em">
        {serviceOrder.elevator.propertyOwner.name}
      </Typography>
      <Typography component="div" variant="caption" color="textSecondary">
        {serviceOrder.elevator.address.fullName}
      </Typography>

      <Button
        label="Assign Technician"
        style={{px: '0.5em', mt: '0.7em'}}
        buttonProps={{
          size: 'small',
        }}
      />

      <Divider sx={{mt: '1.5em'}} />
    </Box>
  );
};
