import {SetStateAction, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Box, {BoxProps} from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';
import {isEmpty} from 'lodash';
import {FormikErrors} from 'formik';
import {JobScheduleType} from 'models/service-order';
import {Button} from 'components/Button';
import {ScheduleForm} from 'pages/ServiceOrderDetails/models';
import {ScheduleDialog} from 'pages/ServiceOrderDetails/Tabs/Overview/ScheduleDialog';
import {
  useRedispatchServiceOrders,
  useUpdateServiceOrderSchedule,
} from 'hooks/reactQuery/useServiceOrder';
import {useMarkNotificationAsRead} from 'hooks/reactQuery/useNotifications';
import {setDateTime, formatDate as formatDateUtil} from 'utils/datetime';
import {
  MessageType,
  NonTechnicianAssignmentData,
  NotificationMessage,
  ServiceOrderAssignedData,
  TechnicianJobScheduleUpdatedData,
} from 'models/notification';
import {
  notificationButtonLabel,
  notificationJSONDataToObject,
  notificationSubtitle,
  notificationTitle,
  notificationTypeToString,
} from 'utils/notification';
import {NotificationIcon} from 'components/NotificationIcon';
import {useFormatDateDistance} from 'hooks/useFormatDateDistance';

interface Props extends BoxProps {
  notification: NotificationMessage<string>;
  closeSideDrawer: () => void;
  read?: boolean;
}

export const NotificationCard = ({
  notification,
  closeSideDrawer,
  read = false,
  ...rest
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const formatDistance = useFormatDateDistance();
  const navigate = useNavigate();
  const [openAssignTechnicianDialog, setOpenAssignTechnicianDialog] =
    useState(false);
  const successMessage = 'Service order scheduled successfully';
  const {mutate: rescheduleServiceOrder} =
    useRedispatchServiceOrders(successMessage);
  const {mutate: scheduleServiceOrder} =
    useUpdateServiceOrderSchedule(successMessage);
  const {
    mutate: markNotificationAsRead,
    isLoading: isLoadingMarkNotificationAsRead,
  } = useMarkNotificationAsRead();
  const [switchActive, setSwitchActive] = useState(true);
  const [form, setForm] = useState<ScheduleForm>({} as ScheduleForm);
  const [formError, setFormErrors] = useState<FormikErrors<ScheduleForm>>();
  const [formValid, setFormValid] = useState(false);
  const notificationData = useMemo(
    () =>
      notificationJSONDataToObject(notification.messageType, notification.data),
    [notification.id],
  );

  useEffect(() => {
    if (
      switchActive &&
      form?.startTime &&
      form.endTime &&
      form.date &&
      form.technicianId
    ) {
      setFormValid(true);
    } else {
      setFormValid(false);
    }

    if (!switchActive) {
      setFormValid(true);
    }
  }, [form, switchActive]);

  const reschedule = () => {
    if (form.technicianId) {
      rescheduleServiceOrder(
        {
          technicianId: form.technicianId,
          serviceOrderId: (notificationData as NonTechnicianAssignmentData)
            ?.serviceOrder?.id,
        },
        {
          onSuccess: () => {
            if (!read) {
              markNotificationAsRead(notification.id);
            }
          },
        },
      );
      setOpenAssignTechnicianDialog(false);
    }
  };

  const schedule = () => {
    const orderStartTime = setDateTime(
      form?.date!,
      formatDateUtil(form.startTime as Date, 'HH:mm')!,
    ).toISOString();
    const orderEndTime = setDateTime(
      form?.date!,
      formatDateUtil(form.endTime as Date, 'HH:mm')!,
    ).toISOString();

    if (form.technicianId) {
      scheduleServiceOrder(
        {
          body: {
            endTime: orderEndTime,
            startTime: orderStartTime,
            technicianIds: [form.technicianId],
            type: JobScheduleType.FIXED,
          },
          serviceOrderId: (notificationData as NonTechnicianAssignmentData)
            ?.serviceOrder?.id,
        },
        {
          onSuccess: () => {
            if (!read) {
              markNotificationAsRead(notification.id);
            }
          },
        },
      );
      setOpenAssignTechnicianDialog(false);
    }
  };

  const handleSaveAssignTechnician = () =>
    switchActive && isEmpty(formError) ? schedule() : reschedule();

  const ctaButtonHandler = () => {
    switch (notification.messageType) {
      case MessageType.EMERGENCY_ORDER_ACCEPTED:
        navigate(
          `/orders/details/${
            (notificationData as ServiceOrderAssignedData).serviceOrder.id
          }`,
        );
        if (!read) {
          markNotificationAsRead(notification.id);
        }
        closeSideDrawer();
        break;
      case MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER:
        setOpenAssignTechnicianDialog(true);
        break;
      case MessageType.TECHNICIAN_JOB_SCHEDULE_UPDATED:
        navigate(
          `/employees/details/${
            (notificationData as TechnicianJobScheduleUpdatedData).technician
              .userAccount.id
          }`,
        );
        if (!read) {
          markNotificationAsRead(notification.id);
        }
        closeSideDrawer();
        break;
      default:
        break;
    }
  };

  return (
    <Box>
      <Box
        sx={{
          py: '1.5em',
          px: '1em',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            '& #mark-as-read-button': {
              display: 'inline-flex',
            },
            [`& #unread-indicator-${notification.id}`]: {
              display: 'none',
            },
          },
        }}
        {...rest}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
            <Box
              sx={{
                width: '2rem',
                height: '2rem',
                bgcolor:
                  notification.messageType ===
                  MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER
                    ? '#FF182F14'
                    : '#0f4c6414',
                p: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <NotificationIcon
                messageType={notification.messageType}
                style={{fontSize: '1rem'}}
              />
            </Box>
            <Typography variant="h6" sx={{textTransform: 'capitalize'}}>
              {t(
                notificationTypeToString(
                  notification.messageType,
                  notificationData,
                ),
              )}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Typography variant="caption" color={theme.palette.text.secondary}>
              {formatDistance(new Date(notification.timestamp))}
            </Typography>
            {!read && (
              <Box
                id={`unread-indicator-${notification.id}`}
                width="0.75rem"
                height="0.75rem"
                borderRadius="50%"
                ml="0.5rem"
                bgcolor={theme.palette.error.main}
              />
            )}
          </Box>
        </Box>

        <Typography variant="subtitle2" pt="0.5rem">
          {notificationTitle(notification.messageType, notificationData)}
        </Typography>
        <Typography variant="body2">
          {notificationSubtitle(notification.messageType, notificationData)}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            label={notificationButtonLabel(notification.messageType)}
            buttonProps={{
              onClick: ctaButtonHandler,
              size: 'medium',
              variant: 'contained',
              sx: {mt: '1rem', py: '0.53rem', px: '1.25rem'},
            }}
          />

          {!read && (
            <Button
              label={t('Mark as read')}
              buttonProps={{
                id: 'mark-as-read-button',
                onClick: () => markNotificationAsRead(notification.id),
                size: 'small',
                variant: 'text',
                sx: {
                  display: 'none',
                  mt: '1rem',
                  py: '0.53rem',
                  px: '1.25rem',
                  textTransform: 'none',
                },
              }}
            />
          )}
        </Box>

        {notification.messageType ===
          MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER && (
          <ScheduleDialog
            disableSaveBtn={!formValid}
            showSwitch
            getSwitchState={(value: SetStateAction<boolean>) =>
              setSwitchActive(value)
            }
            title={t('Assign Technician')}
            datePickerLabel="Schedule To"
            getFormValues={(value: SetStateAction<ScheduleForm>) =>
              setForm(value)
            }
            getFormErrors={(
              errors: SetStateAction<FormikErrors<ScheduleForm> | undefined>,
            ) => setFormErrors(errors)}
            open={openAssignTechnicianDialog}
            onSave={handleSaveAssignTechnician}
            onCancel={() => setOpenAssignTechnicianDialog(false)}
          />
        )}
      </Box>

      {isLoadingMarkNotificationAsRead && (
        <Box height="4px">
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};
