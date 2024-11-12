import {Box} from '@mui/system';
import {PropsWithChildren} from 'react';
import {CellProps} from 'models/table';
import {TableCell} from '@mui/material';

type Props = CellProps & {
  flex?: string;
  gap?: string | number;
  width?: string | number;
  onClick?: () => void;
  align?: string;
  justifyContent?: string;
  maxWidth?: string;
  fieldName?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const Cell = ({
  gap,
  children,
  onClick,
  align = 'left',
  justifyContent,
  noWidthLimit = false,
  ...cellProps
}: PropsWithChildren<Props>) => (
  <TableCell
    role="cell"
    {...(cellProps.fieldName && {'data-field': cellProps.fieldName})}
    sx={{
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#222b451f',
      minHeight: '44px',
      height: '100%',

      ...(cellProps.isFirst && {
        borderLeft: 0,
        left: 0,
        position: 'sticky',
        zIndex: 3,
        backgroundColor: 'white',
      }),
      ...(cellProps.isLast && {
        borderRight: 0,
        right: 0,
        position: 'sticky',
        zIndex: 3,
        backgroundColor: 'white',
      }),
      padding: '9px 12px',
      ...(cellProps.showShadows === 'left' && {
        borderLeft: 0,
        boxShadow: '0 0 14px rgba(0,0,0,0.2)',
        clipPath: 'inset(0 0 0 -14px)',
      }),
      ...(cellProps.showShadows === 'right' && {
        borderRight: 0,
        boxShadow: '0 0 14px rgba(0,0,0,0.2)',
        clipPath: 'inset(0 -14px 0 0)',
      }),

      ...(cellProps.maxWidth && {maxWidth: cellProps.maxWidth}),
      ...(cellProps?.width && {width: cellProps.width}),
      ...(cellProps?.width?.slice(-2) === 'px' && {
        flex: `0 1 ${cellProps.width}`,
      }), // if the width is in pixels
      alignItems: align,
    }}
    onClick={onClick}>
    <Box
      gap={gap ?? 2}
      sx={{
        padding: 0,
        ...(cellProps?.width &&
          !noWidthLimit && {
            width: `calc(${cellProps.width} - 12px)`,
          }),
        ...(cellProps?.maxWidth &&
          !noWidthLimit && {
            maxWidth: `calc(${cellProps.maxWidth} - 12px)`,
          }),
        alignItems: align,
        justifyContent: justifyContent ?? align,
        display: 'flex',
        height: '100%',
      }}>
      {children}
    </Box>
  </TableCell>
);

export default Cell;
