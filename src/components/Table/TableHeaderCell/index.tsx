import {useTranslation} from 'react-i18next';
import {Box} from '@mui/system';
import {IconButton, Typography} from '@mui/material';
import * as _ from 'lodash';
import {ReactComponent as SortingArrows} from 'assets/icons/SortingArrows.svg';
import {TableColumn} from '../../../models/table';

type Props = {
  column: TableColumn;
  gap?: string | number;
  isSortStateToggled: boolean;
  onSort?: () => void;
};

const TableHeaderCell = ({column, gap, isSortStateToggled, onSort}: Props) => {
  const {t} = useTranslation();
  return (
    <Box
      sx={{
        display: 'flex',
        width: column.width,
        padding: '9px 12px',
        alignItems: 'center',
        justifyContent: column.align || 'left',
        flex: '1 1 auto',
        ...(column.width && {width: column.width}),
        ...(column.width.slice(-2) === 'px' && {
          flex: `0 1 ${column.width}`,
        }),
      }}
      gap={gap}>
      {!column.isHeaderNameHidden && (
        <Box sx={{display: 'flex', alignItems: 'center'}} gap={1}>
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
                ...(isSortStateToggled && {transform: 'rotate(180deg)'}),
              }}
              onClick={onSort}>
              <SortingArrows />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TableHeaderCell;
