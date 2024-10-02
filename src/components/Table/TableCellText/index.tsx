import {SxProps, Theme} from '@mui/material';
import Typography from '@mui/material/Typography';
import {PropsWithChildren} from 'react';

type Props = {
  capitalize?: boolean;
  tableCellTextStyles?: SxProps<Theme>;
};

const TableCellText = ({
  capitalize,
  tableCellTextStyles,
  children,
}: PropsWithChildren<Props>) => (
  <Typography
    variant="body2"
    sx={{
      ...tableCellTextStyles,
      ...(capitalize && {textTransform: 'capitalize'}),
    }}
    noWrap>
    {children}
  </Typography>
);

export default TableCellText;
