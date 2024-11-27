import Box from '@mui/material/Box';
import {SxProps, Theme} from '@mui/system';
import {useOutletContext} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Dispatch, ReactNode, SetStateAction, Suspense} from 'react';
import {usePusher} from 'hooks/usePusher';
import {queryKeys} from 'reactQuery/constants';
import {MessageType} from 'models/notification';
import {useQueryClient} from 'react-query';
import {AppTopBar} from './AppTopBar';
import {Progress} from './Progress';

interface Props {
  children: ReactNode;
  excludeDefaultSpacing?: boolean;
  pageScrollable?: boolean;
  containerStyles?: SxProps<Theme>;
  contentStyles?: SxProps<Theme>;
  pageTitle?: string;
  showBackAction?: boolean;
  backBtnLabel?: string;
}

interface OpenContext {
  open?: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const PageLayout = ({
  children,
  excludeDefaultSpacing,
  pageScrollable,
  containerStyles,
  contentStyles,
  pageTitle,
  showBackAction,
  backBtnLabel,
}: Props) => {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  usePusher({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onMessageReceived: (event: MessageType | string) => {
      queryClient.invalidateQueries([queryKeys.queryNotifications]);
      queryClient.invalidateQueries([queryKeys.queryServiceOrders]);
      if (event === MessageType.FILE_UPDATED) {
        queryClient.invalidateQueries([queryKeys.invoiceById]);
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
      }
      if (
        [
          MessageType.EMERGENCE_ASSIGNMENT_REQUEST,
          MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER,
          MessageType.EMERGENCY_ORDER_ACCEPTED,
          MessageType.TECHNICIAN_JOB_SCHEDULE_UPDATED,
          MessageType.SERVICE_ORDER_SCHEDULE_UPDATED,
          MessageType.SERVICE_ORDER_STATUS_CHANGED,
          MessageType.SERVICE_ORDER_SCHEDULE_ALERT,
        ].includes(event as MessageType)
      ) {
        [
          queryKeys.queryServiceOrders,
          queryKeys.queryDueServiceOrders,
          queryKeys.getServiceOrderDetails,
          queryKeys.fetchServiceOrderChecklist,
          queryKeys.serviceOrderActivity,
          queryKeys.queryAppointmentConfirmationRequiredOrders,
        ].map((q) => queryClient.invalidateQueries(q));
      }
    },
  });

  const outletContext: OpenContext | null = useOutletContext();

  const setOpen = outletContext && outletContext.setOpen;

  const handleDrawerClose = () => {
    if (setOpen) {
      setOpen(false);
    }
  };

  return (
    <Box
      data-testid="page-layout-container"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '100vw',
        ...(pageScrollable
          ? {minHeight: '100vh', overflowY: 'scroll'}
          : {height: '98vh', overflowY: 'hidden'}),
        ...containerStyles,
      }}
      onTouchMove={handleDrawerClose}
      onTouchStart={handleDrawerClose}>
      <Box sx={{px: '2.2em', py: '0.5em', backgroundColor: 'white'}}>
        <AppTopBar
          pageTitle={pageTitle && t(pageTitle)}
          showBackAction={showBackAction}
          backBtnLabel={backBtnLabel && t(backBtnLabel)}
        />
      </Box>
      <Box
        sx={{display: 'flex', flexGrow: 1, width: '100%', overflowY: 'hidden'}}>
        <Box width="4.5rem" />
        <Box
          sx={{
            p: '24px',
            mx: !excludeDefaultSpacing ? '24px' : null,
            overflowY: 'auto',
            ...contentStyles,
          }}
          display="flex"
          flexGrow="1"
          width="0"
          flexDirection="column">
          <Suspense fallback={<Progress />}>{children}</Suspense>
        </Box>
      </Box>
    </Box>
  );
};
