import Typography from '@mui/material/Typography';
import {SxProps, Theme} from '@mui/system';

interface Props {
  text: string;
  required?: boolean;
  sx?: SxProps<Theme>;
}

export const FormLabel = ({text, required, sx}: Props) => (
  <Typography variant="caption" color="grey.700" sx={sx}>
    {text}
    {required && (
      <Typography component="span" variant="caption" color="error.light">
        &nbsp;*
      </Typography>
    )}
  </Typography>
);
