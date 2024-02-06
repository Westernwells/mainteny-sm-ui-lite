import {SxProps} from '@mui/system';
import {theme} from 'theme';
export const TechnSectionStyles = {
  icon: theme.unstable_sx({
    width: '1.125rem',
    color: 'text.primary',
  }) as SxProps,
  avatar: theme.unstable_sx({width: '3.125rem', height: '3.125rem'}) as SxProps,
  iconContainer: theme.unstable_sx({
    background: 'background.default',
    width: '3rem',
    height: '2.8rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }) as SxProps,
} as const;
