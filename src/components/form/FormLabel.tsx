import Typography from '@mui/material/Typography';
import {SxProps, Theme} from '@mui/system';
import {useTranslation} from 'react-i18next';

interface Props {
  text: string;
  required?: boolean;
  sx?: SxProps<Theme>;
}

export const FormLabel = ({text, required, sx}: Props) => {
  const {t} = useTranslation();
  return (
    <Typography
      variant="caption"
      color="grey.700"
      textTransform="capitalize"
      sx={sx}>
      {t(text)}
      {required && (
        <Typography component="span" variant="caption" color="error.light">
          &nbsp;*
        </Typography>
      )}
    </Typography>
  );
};
