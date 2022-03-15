import {Box} from '@mui/system';
import {ReactElement} from 'react';
import {AppDrawer} from './AppDrawer';
import {AppTopBar} from './AppTopBar';

interface Props {
  children: ReactElement;
  excludeSidebar?: boolean;
  excludeDefaultSpacing?: boolean;
  overflowY?: boolean;
}

export const PageLayout = ({
  children,
  excludeSidebar,
  excludeDefaultSpacing,
  overflowY,
}: Props) => (
  <Box
    maxWidth="100%"
    display="flex"
    height="100vh"
    sx={{
      overflowY: overflowY ? 'scroll' : 'hidden',
      '::-webkit-scrollbar': {
        width: 0,
        background: 'transparent',
      },
    }}>
    <AppTopBar />
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
        // pb: '1em',
        // border: '2px solid red'
      }}>
      {children}
    </Box>
  </Box>
);
