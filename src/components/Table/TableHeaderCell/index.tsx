import {useTranslation} from 'react-i18next';
import {Box} from '@mui/system';
import {IconButton, Typography} from '@mui/material';
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
  onSort?: () => void;
};

const TableHeaderCell = ({column, gap, sortState, onSort}: Props) => {
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
    <Box
      sx={{
        display: 'flex',
        width: column.width,
        height: '100%',
        padding: '9px 12px',
        alignItems: 'center',
        justifyContent: column.align || 'left',
        flex: '1 1 auto',
        ...(column.width && {width: column.width}),
        ...(column.width.slice(-2) === 'px' && {
          flex: `0 1 ${column.width}`,
        }),

        '&:hover .MuiIconButton-root': {
          ...(!isSortingActive && {opacity: 1}),
        },
      }}
      gap={gap}>
      {!column.isHeaderNameHidden && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
          gap={1}>
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
    </Box>
  );
};

export default TableHeaderCell;
