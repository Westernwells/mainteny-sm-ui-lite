import React, {useEffect, useMemo, useState, Fragment} from 'react';
import {useInView} from 'react-intersection-observer';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import {
  Chip,
  Divider,
  Drawer,
  Grid,
  LinearProgress,
  Tab,
  Typography,
} from '@mui/material';
import {TabContext, TabList, TabPanel} from '@mui/lab';
import {addDays, endOfDay, startOfDay} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {groupBy} from 'lodash';
import {EmptySection} from 'components/EmptySection';
import {Button} from 'components/Button';
import {MessageType, Type} from 'models/notification';
import {formatNotificationsTimestamp} from 'utils/datetime';
import {
  useMarkAllAsRead,
  useNotifications,
} from 'hooks/reactQuery/useNotifications';
import {NotificationCard} from './NotificationCard';
import {NotificationCardSkeleton} from './NotificationCardSkeleton';

export const Notifications = () => {
  const theme = useTheme();
  const {t} = useTranslation();
  const [tabValue, setTabValue] = useState('0');
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const {ref: unreadNotificationsRef, inView: unreadNotificationsInView} =
    useInView();
  const {ref: readNotificationsRef, inView: readNotificationsInView} =
    useInView();
  const {mutate: markAllAsRead, isLoading: isLoadingMarkAllAsRead} =
    useMarkAllAsRead();
  const [newNotifications, setNewNotifications] = useState(0);
  const {
    data: unreadNotifications = {
      pages: [],
      pageParams: [],
    },
    isLoading: isLoadingUnreadNotifications,
    isFetchingNextPage: isFetchingNextUnreadNotificationsPage,
    hasNextPage: hasNextUnreadNotificationsPage,
    fetchNextPage: fetchNextUnreadNotificationsPage,
  } = useNotifications({
    start: startOfDay(addDays(new Date(), -180)).toISOString(),
    end: endOfDay(addDays(new Date(), 2)).toISOString(),
    type: [Type.IN_APP_NOTIFICATION],
    messageType: [
      MessageType.EMERGENCY_ORDER_ACCEPTED,
      MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER,
      MessageType.TECHNICIAN_JOB_SCHEDULE_UPDATED,
    ],
    read: [false],
    pageSize: 10,
    pageIndex: 0,
  });
  const {
    data: readNotifications = {
      pages: [],
      pageParams: [],
    },
    isLoading: isLoadingReadNotifications,
    isFetchingNextPage: isFetchingNextReadNotificationsPage,
    hasNextPage: hasNextReadNotificationsPage,
    fetchNextPage: fetchNextReadNotificationsPage,
  } = useNotifications({
    start: startOfDay(addDays(new Date(), -180)).toISOString(),
    end: endOfDay(addDays(new Date(), 2)).toISOString(),
    type: [Type.IN_APP_NOTIFICATION],
    messageType: [
      MessageType.EMERGENCY_ORDER_ACCEPTED,
      MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER,
      MessageType.TECHNICIAN_JOB_SCHEDULE_UPDATED,
    ],
    read: [true],
    pageSize: 10,
    pageIndex: 0,
  });

  const totalUnreadNotifications = useMemo(() => {
    const pages = unreadNotifications?.pages;
    return pages?.[pages.length - 1]?.total ?? 0;
  }, [unreadNotifications.pages]);

  const totalReadNotifications = useMemo(() => {
    const pages = readNotifications?.pages;
    return pages?.[pages.length - 1]?.total ?? 0;
  }, [readNotifications.pages]);

  const groupedUnreadNotifications = useMemo(
    () =>
      groupBy(
        unreadNotifications.pages.flatMap((i) => i.data),
        (notification) =>
          t(
            `${formatNotificationsTimestamp(
              new Date(notification.timestamp),
              'dd.MM.yyyy',
            )}`,
          ),
      ),
    [unreadNotifications.pages],
  );

  const groupedReadNotifications = useMemo(
    () =>
      groupBy(
        readNotifications.pages.flatMap((i) => i.data),
        (notification) =>
          t(
            `${formatNotificationsTimestamp(
              new Date(notification.timestamp),
              'dd.MM.yyyy',
            )}`,
          ),
      ),
    [readNotifications.pages],
  );

  useEffect(() => {
    if (unreadNotificationsInView && hasNextUnreadNotificationsPage) {
      fetchNextUnreadNotificationsPage();
    }
  }, [unreadNotificationsInView]);

  useEffect(() => {
    if (readNotificationsInView && hasNextReadNotificationsPage) {
      fetchNextReadNotificationsPage();
    }
  }, [readNotificationsInView]);

  useEffect(() => {
    setNewNotifications(totalUnreadNotifications);
  }, [unreadNotifications.pages]);

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
    if (newNotifications > 0) {
      setNewNotifications(0);
    }
  };

  const handleCloseSideDrawer = () => {
    setShowSideDrawer(false);
  };

  const renderUnreadNotifications = () =>
    isLoadingUnreadNotifications ? (
      <NotificationCardSkeleton />
    ) : !isLoadingUnreadNotifications && !totalUnreadNotifications ? (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%">
        <EmptySection
          label="You are up to date!"
          labelVariant="h6"
          illustration="clipboard"
          size="small"
          subLabel="There are no new notifications waiting for you"
          subLabelProps={{
            color: theme.palette.text.secondary,
          }}
        />
      </Box>
    ) : (
      Object.entries(groupedUnreadNotifications).map(([date, data]) => (
        <Fragment key={date}>
          <Box
            display="flex"
            alignItems="center"
            py="10px"
            px="1.5rem"
            bgcolor={theme.palette.grey[50]}>
            <Typography variant="overline" textTransform="uppercase">
              {date}
            </Typography>
          </Box>

          <Box sx={{width: '100%'}}>
            {data.map((notification) => (
              <Box ref={unreadNotificationsRef} key={notification.id}>
                <NotificationCard
                  notification={notification}
                  closeSideDrawer={handleCloseSideDrawer}
                />
                <Divider />
              </Box>
            ))}
          </Box>
        </Fragment>
      ))
    );

  const renderReadNotifications = () =>
    isLoadingUnreadNotifications ? (
      <NotificationCardSkeleton />
    ) : !isLoadingReadNotifications && !totalReadNotifications ? (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%">
        <EmptySection
          label="No notification yet!"
          labelVariant="subtitle1"
          illustration="clipboard"
          size="small"
        />
      </Box>
    ) : (
      Object.entries(groupedReadNotifications).map(([date, data]) => (
        <Fragment key={date}>
          <Box
            display="flex"
            alignItems="center"
            py="10px"
            px="1.5rem"
            bgcolor={theme.palette.grey[50]}>
            <Typography variant="overline" textTransform="uppercase">
              {date}
            </Typography>
          </Box>

          <Box sx={{width: '100%'}}>
            {data.map((notification) => (
              <Box ref={readNotificationsRef} key={notification.id}>
                <NotificationCard
                  notification={notification}
                  closeSideDrawer={handleCloseSideDrawer}
                  read
                />
                <Divider />
              </Box>
            ))}
          </Box>
        </Fragment>
      ))
    );

  const tabItems = useMemo(
    () => [
      {
        id: '0',
        label: (
          <Grid container alignItems="center" justifyContent="center">
            <Typography variant="subtitle1">{t('New')}</Typography>
            {totalUnreadNotifications > 0 && (
              <Chip
                label={totalUnreadNotifications}
                color="error"
                size="small"
                sx={{
                  marginLeft: '6px',
                }}
              />
            )}
          </Grid>
        ),
        component: renderUnreadNotifications(),
        loadingMoreSkeleton: isFetchingNextUnreadNotificationsPage && (
          <NotificationCardSkeleton length={1} />
        ),
      },
      {
        id: '1',
        label: (
          <Typography variant="subtitle1">{t('Read notifications')}</Typography>
        ),
        component: renderReadNotifications(),
        loadingMoreSkeleton: isFetchingNextReadNotificationsPage && (
          <NotificationCardSkeleton length={1} />
        ),
      },
    ],
    [
      isLoadingUnreadNotifications,
      totalUnreadNotifications,
      groupedUnreadNotifications,
      isFetchingNextUnreadNotificationsPage,
      isLoadingReadNotifications,
      totalReadNotifications,
      groupedReadNotifications,
      isFetchingNextReadNotificationsPage,
    ],
  );

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Badge
        onClick={handleOpenSideDrawer}
        badgeContent={newNotifications}
        overlap="circular"
        color="error"
        sx={{
          mx: 4,
          marginTop: 1,
          color: '#FF4B55',
          cursor: 'pointer',
        }}>
        <NotificationsNoneIcon color="primary" sx={{mr: '0.5rem'}} />
      </Badge>
      <Drawer
        anchor="right"
        open={showSideDrawer}
        onClose={handleCloseSideDrawer}
        PaperProps={{
          sx: {
            width: '30em',
            color: 'text.primary',
            background: 'white',
          },
        }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pt="1.25rem"
          px="1rem">
          <Typography variant="h5" letterSpacing="normal" py="0.75rem">
            Notifications
          </Typography>
          {tabValue === '0' &&
            !isLoadingUnreadNotifications &&
            !!unreadNotifications.pages[0].total && (
              <Button
                label={t('Mark all as read')}
                buttonProps={{
                  onClick: () => markAllAsRead(),
                  size: 'small',
                  variant: 'text',
                  sx: {
                    color: theme.palette.primary.main,
                    px: '1rem',
                    py: '0.75rem',
                    textTransform: 'none',
                  },
                }}
              />
            )}
        </Box>

        {isLoadingMarkAllAsRead && (
          <Box height="4px">
            <LinearProgress />
          </Box>
        )}

        <TabContext value={tabValue}>
          <TabList onChange={handleChangeTab} variant="fullWidth">
            {tabItems.map((item) => (
              <Tab
                label={item.label}
                value={item.id}
                key={item.id}
                disableRipple
                sx={{
                  textTransform: 'none',
                }}
              />
            ))}
          </TabList>
          {tabItems.map((item) => (
            <TabPanel
              value={item.id}
              key={item.id}
              sx={{padding: 0, height: '100%'}}>
              {item.component}
              {item.loadingMoreSkeleton}
            </TabPanel>
          ))}
        </TabContext>
      </Drawer>
    </>
  );
};
