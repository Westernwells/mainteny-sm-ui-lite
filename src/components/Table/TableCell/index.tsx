import {Box, SxProps, SystemStyleObject} from '@mui/system';
import {MouseEventHandler, PropsWithChildren} from 'react';
import {CellProps} from 'models/table';
import {TableCell} from '@mui/material';
import {Theme} from '@mui/material/styles';

type Props = CellProps & {
  flex?: string;
  gap?: string | number;
  width?: string | number;
  align?: string;
  justifyContent?: string;
  maxWidth?: string;
  fieldName?: string;
  onClick?: () => void;
  onDoubleClick?: MouseEventHandler<HTMLTableCellElement>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  colSpan?: number;
  testId?: string;
};

const Cell = ({
  gap,
  sx,
  children,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  align = 'left',
  justifyContent,
  firstSticky = true,
  lastSticky = true,
  noWidthLimit = false,
  noPadding = false,
  fullWidth = false,
  colSpan,
  testId,
  ...cellProps
}: PropsWithChildren<Props>) => {
  const defaultSx: SystemStyleObject<Theme> = {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#222b451f',
    minHeight: '44px',
    height: '100%',
    width: fullWidth ? '100%' : undefined,
    ...(cellProps.isFirst && {
      borderLeft: 0,
      ...(firstSticky && {
        backgroundColor: 'white',
        left: 0,
        position: 'sticky',
        zIndex: 3,
      }),
    }),
    ...(cellProps.isLast && {
      borderRight: 0,
      ...(lastSticky && {
        backgroundColor: 'white',
        right: 0,
        position: 'sticky',
        zIndex: 3,
      }),
    }),
    padding: noPadding ? '0' : '9px 12px',
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
    // Check that the width is a string and ends with 'px'
    ...(typeof cellProps?.width === 'string' &&
      cellProps.width.slice(-2) === 'px' && {
        flex: `0 1 ${cellProps.width}`,
      }),
    alignItems: align,
  };

  // Combine defaultSx with the custom sx if provided.
  // This approach prevents having an undefined value in the array.
  const combinedSx: SxProps<Theme> = sx
    ? ([defaultSx, sx] as SxProps<Theme>)
    : defaultSx;

  return (
    <TableCell
      role="cell"
      colSpan={colSpan}
      {...(cellProps.fieldName && {'data-field': cellProps.fieldName})}
      sx={combinedSx}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid={testId}>
      <Box
        gap={gap ?? 2}
        sx={{
          padding: 0,
          ...(cellProps?.width &&
            !noWidthLimit && {
              width: `calc(${cellProps.width} - ${noPadding ? 0 : 12}px)`,
            }),
          ...(cellProps?.maxWidth &&
            !noWidthLimit && {
              maxWidth: `calc(${cellProps.maxWidth} -  ${
                noPadding ? 0 : 12
              }px)`,
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
};

export default Cell;
