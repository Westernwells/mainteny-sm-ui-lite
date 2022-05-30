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
        : {height: '98vh', overflowY: 'hidden'}),
    }}>
    <Box sx={{mx: '2.2em', my: '1em'}}>
      <AppTopBar />
    </Box>
    <Box sx={{display: 'flex', flexGrow: 1, width: '100%'}}>
      {!excludeSidebar ? (
        <Box>
          <AppDrawer />
        </Box>
      ) : null}
      <Box width="4.5rem" />
      <Box
        sx={{
          pt: '1em',
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
