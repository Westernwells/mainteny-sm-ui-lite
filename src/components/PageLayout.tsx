import {Box} from '@mui/system';
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
      ...(pageScrollable
        ? {minHeight: '100vh', overflowY: 'scroll'}
        : {height: '100vh', overflowY: 'hidden'}),
    }}>
    <Box>
      <AppTopBar />
    </Box>
    <Box sx={{display: 'flex', flexGrow: 1}}>
      {!excludeSidebar ? (
        <Box sx={{maxWidth: '20%'}}>
          <AppDrawer />
        </Box>
      ) : null}
      <Box
        sx={{
          flexGrow: 1,
          pt: !excludeDefaultSpacing ? 12 : null,
          px: !excludeDefaultSpacing ? 5 : null,
        }}
        display="flex"
        flexDirection="column">
        {children}
      </Box>
    </Box>
  </Box>

  // <Box
  //   maxWidth="100%"
  //   display="flex"
  //   height="100vh"
  //   sx={{
  // overflowY: overflowY ? 'scroll' : 'hidden',
  // '::-webkit-scrollbar': {
  //   width: 0,
  //   background: 'transparent',
  // },
  //   }}>
  //   <AppTopBar />
  //   {!excludeSidebar ? (
  //     <Box sx={{maxWidth: '20%'}}>
  //       <AppDrawer />
  //     </Box>
  //   ) : null}
  //   <Box
  //     sx={{
  //       flexGrow: 1,
  // pt: !excludeDefaultSpacing ? 12 : null,
  // px: !excludeDefaultSpacing ? 5 : null,
  //     }}>
  //     {children}
  //   </Box>
  // </Box>
);
