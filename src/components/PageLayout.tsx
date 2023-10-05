import Box from '@mui/material/Box';
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

  const {setOpen} = useOutletContext<OpenContext>();

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '100vw',
        ...(pageScrollable
          ? {minHeight: '100vh', overflowY: 'scroll'}
          : {height: '98vh', overflowY: 'hidden'}),
      }}
      onTouchMove={handleDrawerClose}
      onTouchStart={handleDrawerClose}>
      <Box sx={{mx: '2.2em', my: '0.5em'}}>
        <AppTopBar
          pageTitle={pageTitle && t(pageTitle)}
          showBackAction={showBackAction}
          backBtnLabel={backBtnLabel && t(backBtnLabel)}
        />
      </Box>
      <Box sx={{display: 'flex', flexGrow: 1, width: '100%'}}>
        <Box width="4.5rem" />
        <Box
          sx={{
            pt: '1em',
            mx: !excludeDefaultSpacing ? '2.2em' : null,
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
