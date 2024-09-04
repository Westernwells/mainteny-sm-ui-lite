import {Box} from '@mui/system';
import {PropsWithChildren} from 'react';
import {CellProps} from '../../../models/table';

type Props = CellProps & {
  gap?: string | number;
  onClick?: () => void;
};

const Cell = ({
  gap,
  children,
  onClick,
  ...cellProps
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
      flex: `1 1 ${cellProps.width}`,
      alignItems: 'center',
      flexWrap: 'noWrap',
      justifyContent: cellProps.align || 'left',
      ...(cellProps.isFirst && {borderLeft: 0}),
      ...(cellProps.isLast && {borderRight: 0}),
      ...(cellProps.width && {width: cellProps.width}),
      ...(cellProps.width.slice(-2) === 'px' && {
        flex: `0 1 ${cellProps.width}`,
      }), // if the width is in pixels
    }}
    gap={gap ?? 2}
    onClick={onClick}>
    {children}
  </Box>
);

export default Cell;
