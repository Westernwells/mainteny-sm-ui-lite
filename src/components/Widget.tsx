import {useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FilterListIcon from '@mui/icons-material/FilterList';
import useTheme from '@mui/material/styles/useTheme';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ToggleButton from '@mui/material/ToggleButton';
import ViewListIcon from '@mui/icons-material/ViewList';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';

import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {Searchnput} from './SearchInput';

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
}: Props) => {
  const theme = useTheme();
  const [view, setView] = useState('list');

  return (
    <Box>
      <Box display="flex">
        {!hideFilter ? (
          <Box display="flex" mr="1em" my="0.3em">
            <Button
              onClick={() => setShowFilter(!showFilter)}
              disableRipple
              size={theme.breakpoints.down('md') ? 'small' : 'large'}
              sx={{
                backgroundColor: showFilter
                  ? theme.palette.action.selected
                  : theme.palette.primary.outlinedHoverBg,
                border: 'none',
                py: 1,
                height: 40,
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
          <Box mr={!hideViewOption ? '1em' : 0}>
            <Searchnput
              placeholder={searchPlaceholder}
              onValueChanged={(value: string) =>
                getSearchValue && getSearchValue(value)
              }
            />
          </Box>
        ) : null}
        {!hideViewOption ? (
          <ToggleButtonGroup color="secondary" value={view} exclusive>
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
              <FormatAlignLeftIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        ) : null}

        {showNewBtn ? (
          <Button
            variant="contained"
            color="primary"
            size={theme.breakpoints.down('md') ? 'small' : 'large'}
            startIcon={<AddIcon />}
            sx={{ml: '1em'}}>
            {btnLabel}
          </Button>
        ) : null}
      </Box>
    </Box>
  );
};
