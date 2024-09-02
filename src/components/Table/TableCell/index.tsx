import {Box} from '@mui/system';
import {PropsWithChildren} from 'react';
import {TableColumn} from '../../../models/table';

type Props = {
  columnDetails: TableColumn;
  gap?: string | number;
  onClick?: () => void;
};

const Cell = ({
  columnDetails,
  gap,
  children,
  onClick,
}: PropsWithChildren<Props>) => (
  <Box
    sx={{
      display: 'flex',
      padding: '9px 12px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#222b451f',
      minHeight: '44px',
      height: '100%',
      width: '100%',
      flex: '1 1 auto',
      alignItems: 'center',
      flexWrap: 'noWrap',
      justifyContent: columnDetails.align || 'left',
      ...(columnDetails.isFirst && {borderLeft: 0}),
      ...(columnDetails.isLast && {borderRight: 0}),
      ...(columnDetails.width && {width: columnDetails.width}),
    }}
    gap={gap}
    onClick={onClick}>
    {children}
  </Box>
);

export default Cell;
