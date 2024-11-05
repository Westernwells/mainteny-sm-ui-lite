import {SxProps, Theme, TypographyProps} from '@mui/material';
import Typography from '@mui/material/Typography';
import {PropsWithChildren} from 'react';

interface Props extends TypographyProps {
  capitalize?: boolean;
  tableCellTextStyles?: SxProps<Theme>;
}

const TableCellText = ({
  capitalize,
  tableCellTextStyles,
  children,
  ...props
}: PropsWithChildren<Props>) => (
  <Typography
    variant="body2"
    sx={{
      ...tableCellTextStyles,
      ...(capitalize && {textTransform: 'capitalize'}),
    }}
    noWrap
    {...props}>
    {children}
  </Typography>
);

export default TableCellText;
