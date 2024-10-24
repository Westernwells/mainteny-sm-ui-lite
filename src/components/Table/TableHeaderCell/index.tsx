import {useTranslation} from 'react-i18next';
import {Box} from '@mui/system';
import {IconButton, TableCell, Typography} from '@mui/material';
import * as _ from 'lodash';
import {ReactComponent as SortingArrow} from 'assets/icons/SortingArrows.svg';
import {TableColumn} from 'models/table';
import {HeaderSortingState, Order} from 'models/pagination';
import {useMemo} from 'react';
import useTheme from '@mui/material/styles/useTheme';

type Props = {
  column: TableColumn;
  sortState?: HeaderSortingState;
  gap?: string | number;
  isFirst?: boolean;
  isLast?: boolean;
  onSort?: () => void;
};

const TableHeaderCell = ({
  column,
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

        ...(isFirst && {
          borderLeft: 0,
          left: 0,
          zIndex: 7,
        }),
        ...(isLast && {
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
      }}>
      {!column.isHeaderNameHidden && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: column.align || 'left',
          }}
          gap={gap}>
          <Typography variant="subtitle2">
            {_.capitalize(t(column.headerName))}
          </Typography>
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
