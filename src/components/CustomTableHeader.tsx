import {useRef, useState} from 'react';
import {ReactComponent as FilterIcon} from 'assets/icons/FilterIcon.svg';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {Button} from 'components/Button';
import {
  Box,
  Divider,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popover,
  Typography,
} from '@mui/material';
import {GridColDef, GridSortDirection} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import {useLocation} from 'react-router-dom';

import {Order} from '../models/pagination';

interface Props {
  column: GridColDef;
  onSortChange: (field: string, direction: GridSortDirection) => void;
}

const CustomTableHeader = ({column, onSortChange}: Props) => {
  const {t} = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const sortOrder = queryParams.get('sortOrder');

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    event.currentTarget.focus();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSortItemClick = (direction: GridSortDirection) => {
    onSortChange(column.field, direction);
    setAnchorEl(null);
  };

  const handleReset = () => {
    onSortChange('CREATED_DATE', 'desc');
  };
  const anchorRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Box ref={anchorRef} sx={{display: 'flex', alignItems: 'center'}}>
        <Typography variant="subtitle2" color="textSecondary" pr={1.5}>
          {column.headerName && t(column.headerName).toUpperCase()}
        </Typography>
        <IconButton
          onClick={handleClick}
          sx={{
            padding: '0.5em 0em',
            display: 'flex',
            flexDirection: 'column',
            rotate: sortOrder === Order.ASC ? '180deg' : '360deg',
          }}>
          <FilterIcon fontSize="0.9rem" />
        </IconButton>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClick={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPaper-root': {
            width: '189px',
            minHeight: '100px',
          },
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: ' 0.7em 1em',
            alignItems: 'center',
          }}>
          <Typography variant="body2" color="text.secondary">
            {t('Order')}
          </Typography>
          <Button buttonProps={{variant: 'text', onClick: handleReset}}>
            {t('Reset')}
          </Button>
        </Box>
        <Divider />
        <Paper>
          <MenuList>
            <MenuItem
              onClick={() => handleSortItemClick('asc')}
              sx={{py: '0.7em'}}>
              <ArrowUpwardIcon sx={{marginRight: '0.7em', fill: '#8F9BB3'}} />
              {t('Ascending')}
            </MenuItem>
            <MenuItem
              onClick={() => handleSortItemClick('desc')}
              sx={{py: '0.7em'}}>
              <ArrowDownwardIcon sx={{marginRight: '0.7em', fill: '#8F9BB3'}} />
              {t('Descending')}
            </MenuItem>
          </MenuList>
        </Paper>
      </Popover>
    </>
  );
};

export default CustomTableHeader;
