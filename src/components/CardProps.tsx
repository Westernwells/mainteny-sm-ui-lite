import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ReactNode} from 'react';

interface Props {
  icon: JSX.Element;
  label: string;
  bodyTextVariant?: any;
  titleTextVariant?: any;
  iconBackground?: string;
  bodyText: string | JSX.Element | ReactNode;
  iconMaxHeight?: string | number;
  containerStyles?: {[key: string]: any};
  bodyStyle?: {[key: string]: any};
  labelStyle?: {[key: string]: any};
}

export const CardProps = ({
  label,
  bodyTextVariant,
  titleTextVariant,
  icon,
  iconBackground,
  bodyText,
  iconMaxHeight,
  containerStyles,
  bodyStyle,
  labelStyle,
}: Props) => (
  <Box display="flex" sx={{...containerStyles}}>
    {/* remove width to make this component more generic */}
    <Box
      sx={{
        background: iconBackground,
        p: '0.7em',
        display: 'flex',
        justifyContent: 'center',
        mr: '1em',
        maxHeight: iconMaxHeight || 'default',
      }}>
      {icon}
    </Box>
    <Box>
      <Typography
        component="div"
        variant={titleTextVariant || 'caption'}
        color="textSecondary"
        sx={{...labelStyle}}>
        {label}
      </Typography>

      {typeof bodyText === 'string' ? (
        <Typography
          component="div"
          variant={bodyTextVariant || 'body2'}
          sx={{...bodyStyle}}>
          {bodyText}
        </Typography>
      ) : (
        bodyText
      )}
    </Box>
  </Box>
);
