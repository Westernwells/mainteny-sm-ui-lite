import Typography from '@mui/material/Typography';
import {SxProps, Theme} from '@mui/system';

interface Props {
  text: string;
  sx?: SxProps<Theme>;
}

export const Label = ({text, sx}: Props) => (
  <Typography variant="caption" color="grey.700" sx={sx}>
    {text}
  </Typography>
);
