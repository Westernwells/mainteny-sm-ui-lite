import Typography from '@mui/material/Typography';
import {PropsWithChildren} from 'react';

type Props = {
  capitalize?: boolean;
};

const TableCellText = ({capitalize, children}: PropsWithChildren<Props>) => (
  <Typography
    variant="body2"
    sx={{
      ...(capitalize && {textTransform: 'capitalize'}),
    }}
    noWrap>
    {children}
  </Typography>
);

export default TableCellText;
