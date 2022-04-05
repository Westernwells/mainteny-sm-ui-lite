import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
  icon: JSX.Element;
  label: string;
  bodyTextVariant?: any;
  titleTextVariant?: any;
  iconBackground?: string;
  bodyText: string | JSX.Element;
  iconMaxHeight?: string | number;
  containerStyles?: {[key: string]: string | number};
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
}: Props) => (
  <Box display="flex" width="100%" sx={{...containerStyles}}>
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
      <Box>
        <Typography
          variant={titleTextVariant || 'caption'}
          color="textSecondary">
          {label}
        </Typography>
      </Box>
      {typeof bodyText === 'string' ? (
        <Box>
          <Typography variant={bodyTextVariant || 'body2'}>
            {bodyText}
          </Typography>
        </Box>
      ) : (
        bodyText
      )}
    </Box>
  </Box>
);
