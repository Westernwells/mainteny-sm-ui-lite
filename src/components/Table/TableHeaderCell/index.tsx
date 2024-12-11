import {useTranslation} from 'react-i18next';
import {Box} from '@mui/system';
import {IconButton, TableCell, Tooltip, Typography} from '@mui/material';
import {ReactComponent as SortingArrow} from 'assets/icons/SortingArrows.svg';
import {TableColumn} from 'models/table';
import {HeaderSortingState, Order} from 'models/pagination';
import {useMemo} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import {capitalize} from 'lodash';

type Props = {
  column: TableColumn;
  sortState?: HeaderSortingState;
  gap?: string | number;
  isFirst?: boolean;
  isLast?: boolean;
  onSort?: () => void;
};

const TableHeaderCell = ({
  column: {
    firstSticky = true,
    lastSticky = true,
    textTransform = true,
    ...column
  },
  gap = 1,
  sortState,
  isFirst = false,
  isLast = false,

  onSort,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const {isSortStateDesc, isSortingActive} = useMemo(() => {
    if (column.fieldName !== sortState?.columnName)
      return {
        isSortingActive: false,
        isSortStateDesc: false,
      };

    return {
      isSortingActive: true,
      isSortStateDesc:
        column.fieldName === sortState?.columnName &&
        sortState?.order === Order.DESC,
    };
  }, [column, sortState]);

  return (
    <TableCell
      sx={{
        padding: '9px 12px',
        alignItems: 'center',
        backgroundColor: 'white',
        position: 'sticky',
        zIndex: 6,
        minHeight: 40,

        ...(isFirst &&
          firstSticky && {
            borderLeft: 0,
            left: 0,
            zIndex: 7,
          }),
        ...(isLast &&
          lastSticky && {
            borderRight: 0,
            right: 0,
            zIndex: 7,
          }),

        ...(column.showShadows === 'left' && {
          borderLeft: 0,
          boxShadow: '0 0 14px rgba(0,0,0,0.2)',
          clipPath: 'inset(0 0 0 -14px)',
        }),
        ...(column.showShadows === 'right' && {
          borderRight: 0,
          boxShadow: '0 0 14px rgba(0,0,0,0.2)',
          clipPath: 'inset(0 -14px 0 0)',
        }),

        '&:hover .MuiIconButton-root': {
          ...(!isSortingActive && {opacity: 1}),
        },

        ...(column.maxWidth && {maxWidth: column.maxWidth}),
        ...(column?.width && {width: column.width}),
        ...(column?.width?.slice(-2) === 'px' && {
          flex: `0 1 ${column.width}`,
        }), // if the width is in pixels
      }}>
      {!column.isHeaderNameHidden && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: column.align || 'left',

            ...(column?.width &&
              !column.noWidthLimit && {
                width: `calc(${column.width} - 12px)`,
              }),
            ...(column?.maxWidth &&
              !column.noWidthLimit && {
                maxWidth: `calc(${column.maxWidth} - 12px)`,
              }),
          }}
          gap={gap}>
          <Tooltip
            title={
              textTransform
                ? capitalize(t(column.headerName))
                : t(column.headerName)
            }
            arrow
            placement="top">
            <Typography sx={{cursor: 'default'}} noWrap variant="subtitle2">
              {textTransform
                ? capitalize(t(column.headerName))
                : t(column.headerName)}
            </Typography>
          </Tooltip>
          {onSort && (
            <IconButton
              sx={{
                width: '16px',
                height: '16px',
                padding: '2px',
                borderRadius: '4px',

                ...(isSortingActive && {color: theme.palette.primary.main}),
                ...(isSortStateDesc && {transform: 'rotate(180deg)'}),
                ...(!isSortingActive && {opacity: 0}),
              }}
              onClick={onSort}>
              <SortingArrow />
            </IconButton>
          )}
        </Box>
      )}
    </TableCell>
  );
};

export default TableHeaderCell;
