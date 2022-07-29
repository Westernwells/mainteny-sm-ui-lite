import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import {ReactNode} from 'react';
import {usePusher} from 'hooks/usePusher';
import {queryKeys} from 'reactQuery/constants';
import {MessageType} from 'models/notification';
import {useQueryClient} from 'react-query';
import {AppDrawer} from './AppDrawer';
import {AppTopBar} from './AppTopBar';

interface Props {
  children: ReactNode;
  excludeSidebar?: boolean;
  excludeDefaultSpacing?: boolean;
  pageScrollable?: boolean;
  pageTitle?: string;
  showBackAction?: boolean;
  backBtnLabel?: string;
}

export const PageLayout = ({
  children,
  excludeSidebar,
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
    },
  });
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '100vw',
        ...(pageScrollable
          ? {minHeight: '100vh', overflowY: 'scroll'}
          : {height: '98vh', overflowY: 'hidden'}),
      }}>
      <Box sx={{mx: '2.2em', my: '0.5em'}}>
        <AppTopBar
          pageTitle={pageTitle && t(pageTitle)}
          showBackAction={showBackAction}
          backBtnLabel={backBtnLabel && t(backBtnLabel)}
        />
      </Box>
      <Box sx={{display: 'flex', flexGrow: 1, width: '100%'}}>
        {!excludeSidebar ? <AppDrawer /> : null}
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
          {children}
        </Box>
      </Box>
    </Box>
  );
};
