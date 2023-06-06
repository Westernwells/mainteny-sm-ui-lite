import Typography from '@mui/material/Typography';
import {SxProps, Theme} from '@mui/system';
import {useTranslation} from 'react-i18next';

interface Props {
  text: string;
  textTranslationContext?: string;
  required?: boolean;
  sx?: SxProps<Theme>;
}

export const FormLabel = ({
  text,
  required,
  textTranslationContext,
  sx,
}: Props) => {
  const {t} = useTranslation();
  return (
    <Typography
      variant="caption"
      color="grey.700"
      textTransform="capitalize"
      sx={sx}>
      {t(text, {context: textTranslationContext})}
      {required && (
        <Typography component="span" variant="caption" color="error.main">
          &nbsp;*
        </Typography>
      )}
    </Typography>
  );
};
