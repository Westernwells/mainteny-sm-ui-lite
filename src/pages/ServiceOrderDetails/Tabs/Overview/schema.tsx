import {isSameDay} from 'date-fns';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import {toDate} from 'utils/datetime';
import {theme} from 'theme';
import {CardProps} from 'components/CardProps';
import {useFormatDate} from 'hooks/useFormatDate';
import {
  CheckCircle,
  DateRange,
  FeaturedPlayList,
  InfoOutlined,
  LocalLibrary,
  LocationOn,
  PersonOutline,
  Tag,
} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';

interface OrderInfoProps {
  serviceOrderDetails: ServiceOrderView;
  label: string;
}

export const OrderInfo = ({serviceOrderDetails, label}: OrderInfoProps) => {
  const formatDate = useFormatDate();
  const {t} = useTranslation();
  const renderSection = () => {
    switch (label) {
      case 'customer':
        return (
          <CardProps
            icon={<PersonOutline sx={{color: theme.palette.info.main}} />}
            label="CUSTOMER"
            bodyText={serviceOrderDetails.elevator.propertyOwner.name || '-'}
            navigateTo={`/customers/details/${serviceOrderDetails.elevator.propertyOwner.id}?tab=0`}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'calledBy':
        return (
          <CardProps
            icon={<LocalLibrary sx={{color: theme.palette.info.main}} />}
            label={t('Called By').toLocaleUpperCase()}
            bodyText={
              <Typography variant="body2">
                {serviceOrderDetails.additionalInfo.callerInfo?.name || '-'}
              </Typography>
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
            bodyStyle={{color: theme.palette.primary.main}}
          />
        );
      case 'purchaseOrderNumber':
        return (
          <CardProps
            icon={<Tag sx={{color: theme.palette.info.main}} />}
            label={t('Purchase Order Number').toLocaleUpperCase()}
            bodyText={
              serviceOrderDetails.additionalInfo.purchaseOrderNumber || '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
            bodyStyle={{color: theme.palette.primary.main, paddingTop: '0.2em'}}
          />
        );
      case 'unitAddress':
        return (
          <CardProps
            icon={<LocationOn sx={{color: theme.palette.info.main}} />}
            label="UNIT ADDRESS"
            bodyText={serviceOrderDetails.elevator.address.fullName || '-'}
            navigateTo={`/units?tab=1&searchUnitsMapView=${serviceOrderDetails.elevator.address.fullName}`}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="30em"
          />
        );
      case 'unitNumber':
        return (
          <CardProps
            icon={<FeaturedPlayList sx={{color: theme.palette.info.main}} />}
            label="UNIT NUMBER"
            bodyText={serviceOrderDetails.elevator.externalId || '-'}
            navigateTo={`/units/details/${serviceOrderDetails.elevator.id}`}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'contractNumber':
        return (
          <CardProps
            icon={<InfoOutlined sx={{color: theme.palette.info.main}} />}
            label="NUMBER"
            bodyText={serviceOrderDetails.contract?.externalId || '-'}
            navigateTo={
              serviceOrderDetails.contract &&
              `/contracts/details/${serviceOrderDetails.contract?.id}`
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'contractName':
        return (
          <CardProps
            icon={<InfoOutlined sx={{color: theme.palette.info.main}} />}
            label={t('Name').toUpperCase()}
            bodyText={serviceOrderDetails.contract?.name || '-'}
            navigateTo={serviceOrderDetails.contract?.name && '/settings'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'contractType':
        return (
          <CardProps
            icon={<InfoOutlined sx={{color: theme.palette.info.main}} />}
            label="TYPE"
            bodyText={serviceOrderDetails.contract?.type || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
            bodyStyle={{color: theme.palette.primary.main, paddingTop: '0.2em'}}
          />
        );
      case 'dueDate':
        return (
          <CardProps
            icon={<DateRange sx={{color: theme.palette.info.main}} />}
            label="DUE DATE"
            bodyText={formatDate(new Date(serviceOrderDetails.dueDate)) || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
            bodyStyle={{color: theme.palette.primary.main, paddingTop: '0.2em'}}
          />
        );
      case 'dateScheduled':
        return (
          <CardProps
            icon={
              serviceOrderDetails.status === ServiceOrderStatus.COMPLETED ? (
                <CheckCircle sx={{color: theme.palette.info.main}} />
              ) : (
                <TimelapseIcon sx={{color: theme.palette.info.main}} />
              )
            }
            label={
              serviceOrderDetails.status === ServiceOrderStatus.COMPLETED
                ? t('Completed On').toUpperCase()
                : t('Scheduled Date').toUpperCase()
            }
            bodyText={
              serviceOrderDetails.schedules &&
              serviceOrderDetails.schedules.length ? (
                <Box>
                  <Typography variant="body2" sx={{paddingTop: '0.2em'}}>
                    {serviceOrderDetails.status ===
                      ServiceOrderStatus.COMPLETED ||
                    isSameDay(
                      toDate(serviceOrderDetails.schedules[0].startTime),
                      toDate(serviceOrderDetails.schedules[0].endTime),
                    )
                      ? formatDate(
                          toDate(serviceOrderDetails.schedules[0].endTime),
                        )
                      : `${formatDate(
                          toDate(serviceOrderDetails.schedules[0].startTime),
                        )} - ${formatDate(
                          toDate(serviceOrderDetails.schedules[0].endTime),
                        )}`}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{paddingTop: '0.2em'}}
                    color={theme.palette.text.secondary}>
                    {`${formatDate(
                      toDate(serviceOrderDetails.schedules[0].startTime),
                      'HH:mm',
                    )} -
                    ${formatDate(
                      toDate(serviceOrderDetails.schedules[0].endTime),
                      'HH:mm',
                    )}
                   `}
                  </Typography>
                </Box>
              ) : (
                '-'
              )
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
            bodyStyle={{color: theme.palette.primary.main, paddingTop: '0.2em'}}
          />
        );
      case 'technicians':
        return (
          <CardProps
            icon={<ManageAccountsIcon sx={{color: theme.palette.info.main}} />}
            label="TECHNICIAN"
            bodyText={
              serviceOrderDetails.schedules &&
              serviceOrderDetails.schedules.length
                ? serviceOrderDetails.schedules
                    .map(
                      (item) =>
                        `${item.technician.userAccount.firstName} ${item.technician.userAccount.lastName}`,
                    )
                    .join(', ')
                : serviceOrderDetails.additionalInfo?.candidateTechnician
                ? `${serviceOrderDetails.additionalInfo?.candidateTechnician.userAccount.firstName} ${serviceOrderDetails.additionalInfo?.candidateTechnician.userAccount.lastName}`
                : '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
            bodyStyle={{color: theme.palette.primary.main, paddingTop: '0.2em'}}
          />
        );
      default:
        return null;
    }
  };
  return renderSection();
};
