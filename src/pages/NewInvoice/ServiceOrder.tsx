import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import {ServiceOrderView} from 'models/service-order';
import {FlexContainer} from 'components/FlexContainer';
import {PageCard} from 'components/PageCard';
import {CardProps} from 'components/CardProps';
import {StatusChip} from 'components/StatusChip';
import ConstructionIcon from '@mui/icons-material/Construction';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {formatDate} from 'utils/datetime';
import {convertToText} from 'utils/utils';
import {ServiceOrderAutoComplete} from './ServiceOrderAutoComplete';

interface Props {
  setSelectedOrder: Dispatch<SetStateAction<ServiceOrderView | null>>;
  selectedOrder: ServiceOrderView | null;
}

export const ServiceOrder = ({selectedOrder, setSelectedOrder}: Props) => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (selectedOrder) {
      setItems([
        {
          label: 'ORDER TYPE',
          bodyText: convertToText(selectedOrder.type),
          icon: <ConstructionIcon sx={{color: 'info.dark'}} />,
        },
        {
          label: 'CUSTOMER',
          bodyText: selectedOrder.elevator.propertyOwner.name,
          icon: <ApartmentIcon sx={{color: 'info.dark'}} />,
        },
        {
          label: 'TECHNICIANS',
          bodyText:
            selectedOrder.schedules.length &&
            'technician' in selectedOrder.schedules[0]
              ? `${selectedOrder.schedules[0].technician.userAccount.firstName} ${selectedOrder.schedules[0].technician.userAccount.lastName}`
              : ' ',
          icon: <PersonIcon sx={{color: 'info.dark'}} />,
        },
        {
          label: 'SCHEDULED DATE & TIME',
          bodyText:
            selectedOrder.schedules.length &&
            'startTime' in selectedOrder.schedules[0] &&
            'endTime' in selectedOrder.schedules[0]
              ? `${formatDate(
                  selectedOrder.schedules[0].startTime,
                )}, ${new Date(
                  selectedOrder.schedules[0].startTime,
                ).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}-${new Date(
                  selectedOrder.schedules[0].endTime,
                ).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                `
              : ' ',
          icon: <CalendarTodayIcon sx={{color: 'info.dark'}} />,
        },
        {
          label: 'DUE DATE',
          bodyText: formatDate(selectedOrder.dueDate),
          icon: <FlagIcon sx={{color: 'info.dark'}} />,
        },
      ]);
    }
  }, [selectedOrder]);

  return (
    <FlexContainer containerStyle={{mt: '2em'}}>
      <PageCard headerLabel="Service Order" containerStyles={{flexGrow: 1}}>
        <ServiceOrderAutoComplete
          label="Search"
          getServiceOrder={(value) => setSelectedOrder(value)}
          fieldStyles={{maxWidth: 'min(60%, 48em)'}}
        />
        {selectedOrder && (
          <>
            <FlexContainer
              containerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: '1em',
                mb: '2em',
              }}>
              <Typography variant="subtitle1">
                {selectedOrder.number}
              </Typography>
              <StatusChip
                color={getServiceOrderStatusColor(selectedOrder.status)}
                label={serviceOrderStatusToString(selectedOrder.status)}
                size="small"
              />
            </FlexContainer>

            <Grid container spacing={4}>
              {items.map((item) => (
                <Grid item key={item.label} xs={4}>
                  <CardProps
                    label={item.label}
                    bodyText={item.bodyText}
                    icon={item.icon}
                    iconBackground="info.outlinedHoverBg"
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </PageCard>
    </FlexContainer>
  );
};
