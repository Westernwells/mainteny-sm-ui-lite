import {useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FilterListIcon from '@mui/icons-material/FilterList';
import useTheme from '@mui/material/styles/useTheme';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ToggleButton from '@mui/material/ToggleButton';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {SearchInput} from './SearchInput';

interface Props {
  searchPlaceholder?: string;
  openMapView?: () => void;
  closeMapView?: () => void;
  showFilter: boolean;
  setShowFilter: (state: boolean) => void;
  hideViewOption?: boolean;
  hideSearchInput?: boolean;
  hideFilter?: boolean;
  getSearchValue?: (val: string) => void;
  showNewBtn?: boolean;
  btnLabel?: string;
  btnOnClick?: () => void;
  containerStyles?: {[key: string]: string | number};
}

export const Widget = ({
  searchPlaceholder,
  openMapView,
  closeMapView,
  showFilter,
  setShowFilter,
  hideViewOption = false,
  hideFilter = false,
  showNewBtn = false,
  hideSearchInput = false,
  btnLabel = '',
  getSearchValue,
  btnOnClick,
  containerStyles,
}: Props) => {
  const theme = useTheme();
  const [view, setView] = useState('list');

  return (
    <Box display="flex" sx={{...containerStyles}}>
      {!hideFilter ? (
        <Box display="flex">
          <Button
            onClick={() => setShowFilter(!showFilter)}
            disableRipple
            size={theme.breakpoints.down('md') ? 'small' : 'large'}
            sx={{
              backgroundColor: showFilter
                ? theme.palette.action.selected
                : theme.palette.primary.outlinedHoverBg,
              border: 'none',
              py: '0.5em',
              ':hover': {
                border: 'none',
              },
            }}
            variant="outlined"
            startIcon={<FilterListIcon />}>
            <Typography variant="body1" sx={{textTransform: 'capitalize'}}>
              Filter
            </Typography>
          </Button>
        </Box>
      ) : null}

      {!hideSearchInput ? (
        <Box ml="0.8em">
          <SearchInput
            placeholder={searchPlaceholder}
            onValueChanged={(value: string) =>
              getSearchValue && getSearchValue(value)
            }
          />
        </Box>
      ) : null}
      {!hideViewOption ? (
        <ToggleButtonGroup
          color="secondary"
          value={view}
          exclusive
          sx={{ml: '0.8em'}}>
          <ToggleButton
            value="list"
            aria-label="list"
            onClick={() => {
              setView('list');
              if (closeMapView) {
                closeMapView();
              }
            }}>
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton
            value="module"
            aria-label="module"
            onClick={() => {
              setView('module');
              if (openMapView) {
                openMapView();
              }
            }}>
            <GridViewIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      ) : null}

      {showNewBtn ? (
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          sx={{
            textTransform: 'capitalize',
            ml: '0.8em',
          }}
          onClick={() => (btnOnClick ? btnOnClick() : () => {})}>
          {btnLabel}
        </Button>
      ) : null}
    </Box>
  );
};
