import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FilterListIcon from '@mui/icons-material/FilterList';
import useTheme from '@mui/material/styles/useTheme';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import Button from '@mui/material/Button';
import {Searchnput} from './SearchInput';

interface Props {
  searchPlaceholder?: string;
  onSearchTextChanged?: (text: string) => void;
  openMapView?: () => void;
  closeMapView?: () => void;
  mapViewActive?: boolean;
  showFilter: boolean;
  setShowFilter: (state: boolean) => void;
  hideViewOption?: boolean;
  hideFilter?: boolean;
}

export const Widget = ({
  searchPlaceholder,
  onSearchTextChanged,
  openMapView,
  closeMapView,
  mapViewActive,
  showFilter,
  setShowFilter,
  hideViewOption = false,
  hideFilter = false,
}: Props) => {
  const theme = useTheme();

  return (
    <Box>
      <Box display="flex">
        {!hideFilter ? (
          <Box display="flex" mr={3}>
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
                height: 48,
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

        <Box mr={!hideViewOption ? 3 : 0}>
          <Searchnput
            placeholder={searchPlaceholder}
            onValueChanged={onSearchTextChanged}
          />
        </Box>
        {!hideViewOption ? (
          <ButtonGroup variant="outlined" size="small" sx={{height: 48}}>
            <Button
              disableRipple
              variant="outlined"
              onClick={() => (closeMapView ? closeMapView() : () => {})}
              sx={{
                background: !mapViewActive
                  ? theme.palette.action.selected
                  : '#fff',
                '&:hover': {
                  background: !mapViewActive
                    ? theme.palette.action.selected
                    : '#fff',
                },
              }}>
              <FormatListBulletedIcon />
            </Button>
            <Button
              disableRipple
              onClick={() => (openMapView ? openMapView() : () => {})}
              sx={{
                background: mapViewActive
                  ? theme.palette.action.selected
                  : '#fff',
                '&:hover': {
                  background: mapViewActive
                    ? theme.palette.action.selected
                    : '#fff',
                },
              }}
              variant="outlined">
              <GridViewIcon />
            </Button>
          </ButtonGroup>
        ) : null}
      </Box>
    </Box>
  );
};
