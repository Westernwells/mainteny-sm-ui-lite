import Box from '@mui/material/Box';
import {SxProps, Theme} from '@mui/system';
import {useOutletContext} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Dispatch, ReactNode, SetStateAction, Suspense} from 'react';
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
  path?: string;
  onBackAction?: () => void;
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
  path,
  onBackAction,
}: Props) => {
  const {t} = useTranslation();

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
          path={path}
          onBackAction={onBackAction}
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
