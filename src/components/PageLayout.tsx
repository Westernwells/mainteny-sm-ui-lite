import Box from '@mui/material/Box';
import {ReactElement} from 'react';
import {AppDrawer} from './AppDrawer';
import {AppTopBar} from './AppTopBar';

interface Props {
  children: ReactElement;
  excludeSidebar?: boolean;
  excludeDefaultSpacing?: boolean;
  pageScrollable?: boolean;
}

export const PageLayout = ({
  children,
  excludeSidebar,
  excludeDefaultSpacing,
  pageScrollable,
}: Props) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '100vw',
      ...(pageScrollable
        ? {minHeight: '100vh', overflowY: 'scroll'}
        : {height: '100vh', overflowY: 'hidden'}),
    }}>
    <Box>
      <AppTopBar />
    </Box>
    <Box sx={{display: 'flex', flexGrow: 1, width: '100%'}}>
      {!excludeSidebar ? (
        <Box>
          <AppDrawer />
        </Box>
      ) : null}
      <Box
        sx={{
          pt: !excludeDefaultSpacing ? 12 : null,
          mx: !excludeDefaultSpacing ? '2.2em' : null,
        }}
        display="flex"
        flexGrow="1"
        width="80%"
        flexDirection="column">
        {children}
      </Box>
    </Box>
  </Box>
);
