import {theme} from 'theme';

export const containerStyle = {
  width: '100%',
  borderBottomRightRadius: '4px',
  borderBottomLeftRadius: '4px',
  padding: '4px 16px',
  background: '#F7F9FC',
  display: 'flex',
  height: '24px',
  justifyContent: 'flex-start',
  gap: theme.spacing(2),
};

export const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
};

export const iconButtonStyle = {
  background: '#0F4C6414',
  color: theme.palette.primary.main,
  borderRadius: '2px',
  width: '12px',
  height: '12px',
  display: 'flex',
};

export const iconButtonContainerStyle = {
  display: 'flex',
  gap: theme.spacing(0.25),
};

export const escIconButtonStyle = {
  ...iconButtonStyle,
  width: '19px',
  padding: '2px 0',
};

export const textStyle = {
  borderRadius: '2px',
  color: theme.palette.text.secondary,
  lineHeight: '16px',
  fontSize: '10px',
};

export const escTextStyle = {
  ...textStyle,
  width: '15px',
  fontSize: '8px',
  lineHeight: '11px',
};
