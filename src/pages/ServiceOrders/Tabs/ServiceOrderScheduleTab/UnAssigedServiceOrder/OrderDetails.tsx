import {useMemo, useState} from 'react';
import {isAfter} from 'date-fns';
import Box, {BoxProps} from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LocationOn from '@mui/icons-material/LocationOn';
import Tag from '@mui/icons-material/Tag';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderView} from 'models/service-order';
import {Button} from 'components/Button';
import {useTranslation} from 'react-i18next';
import {ScheduleDialog} from 'pages/ServiceOrderDetails/Tabs/Overview/ScheduleDialog';
import {
  getJobTypeGivenName,
  serviceOrderTypeToString,
} from 'utils/service-order-utils';
import {useFormatDateDistance} from 'hooks/useFormatDateDistance';
import {
  useCompanyJobTypes,
  useOldCompanyJobTypes,
} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

interface Props extends BoxProps {
  serviceOrder: ServiceOrderView;
}

export const OrderDetails = ({serviceOrder, ...rest}: Props) => {
  const {user} = useUserSession();
  const {t, i18n} = useTranslation();
  const formatDateDistance = useFormatDateDistance();

  const {data: jobTypes} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );
  const {data: oldJobTypes} = useOldCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  // Filter out oldJobTypes that already exist in jobTypes based on the 'name' property
  const filteredOldJobTypes = oldJobTypes?.filter(
    (oldJobType) =>
      !jobTypes?.some((jobType) => jobType.name === oldJobType.name),
  );

  // Combine jobTypes and the filtered oldJobTypes
  const allJobTypes = [...(jobTypes || []), ...(filteredOldJobTypes || [])];

  const [openDialog, setOpenDialog] = useState(false);

  const dueDate = useMemo(() => {
    const dueDateObj = new Date(serviceOrder.dueDate);

    // check if date is future date
    if (isAfter(dueDateObj, new Date())) {
      return `${t('Due in')} ${formatDateDistance(dueDateObj, undefined, {
        addSuffix: false,
      })}`;
    }

    return `${t('Due')} ${formatDateDistance(dueDateObj)}`;
  }, [serviceOrder.dueDate, i18n.language]);

  return (
    <Box sx={{py: 1.5, px: '1rem'}} {...rest}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
        <Box sx={{display: 'flex'}}>
          <ServiceOrderIcons
            serviceOrderType={serviceOrder.type}
            style={{width: '1.14rem', height: '1.02rem', mt: '0.1em'}}
          />
          <Typography
            variant="smallBtnText"
            sx={{textTransform: 'uppercase', ml: '0.5em', pt: 0.1}}>
            {serviceOrderTypeToString(
              getJobTypeGivenName(serviceOrder?.type, allJobTypes),
            ) === '-'
              ? getJobTypeGivenName(serviceOrder?.type, allJobTypes)
              : t(
                  serviceOrderTypeToString(
                    getJobTypeGivenName(serviceOrder?.type, allJobTypes),
                  ),
                )}
          </Typography>
        </Box>
        <Typography variant="caption">{dueDate}</Typography>
      </Box>
      <Typography
        variant="subtitle2"
        component="div"
        mt="0.5em"
        color="primary.dark">
        {serviceOrder.elevator.propertyOwner.name}
      </Typography>
      <Box display="flex" alignItems="center" py={0.25} gap={0.5}>
        <LocationOn fontSize="small" sx={{color: 'text.disabled'}} />
        <Typography variant="caption" color="textSecondary" pt={0.5}>
          {serviceOrder.elevator.address.fullName}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" py={0.25} pb={1.5} gap={0.5}>
        <Tag fontSize="small" sx={{color: 'text.disabled'}} />
        <Typography variant="caption" color="textSecondary" pt={0.5}>
          {serviceOrder.elevator.externalId || '-'}
        </Typography>
      </Box>

      <Button
        label={t('Assign Engineer')}
        style={{px: '0.5em'}}
        buttonProps={{
          onClick: () => setOpenDialog(true),
          size: 'medium',
          fullWidth: true,
          variant: 'outlined',
          sx: {
            bgcolor: 'transparent',
            '&:hover': {bgcolor: 'primary.dark', color: 'white'},
          },
        }}
      />

      <ScheduleDialog
        serviceOrderId={serviceOrder.id}
        serviceOrderType={serviceOrder?.type}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        defaultStartDate={
          serviceOrder.schedules.length
            ? new Date(serviceOrder.schedules[0].startTime)
            : null
        }
        defaultEndDate={
          serviceOrder.schedules.length
            ? new Date(serviceOrder.schedules[0].endTime)
            : null
        }
      />
    </Box>
  );
};
