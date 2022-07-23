import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {SxProps} from '@mui/system';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

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
  iconContainerStyles?: SxProps;
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
  iconContainerStyles = {},
}: Props) => {
  const {t} = useTranslation();
  return (
    <Box display="flex" sx={{...containerStyles}}>
      {/* remove width to make this component more generic */}
      <Box
        sx={{
          backgroundColor: iconBackground,
          p: '0.7em',
          display: 'flex',
          justifyContent: 'center',
          mr: '1em',
          maxHeight: iconMaxHeight || 'default',
          ...iconContainerStyles,
        }}>
        {icon}
      </Box>
      <Box>
        <Typography
          component="div"
          variant={titleTextVariant || 'caption'}
          color="textSecondary"
          sx={{textTransform: 'capitalize', ...labelStyle}}>
          {t(label)}
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
};
