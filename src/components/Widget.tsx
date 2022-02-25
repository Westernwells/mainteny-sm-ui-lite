import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Theme} from '@mui/material/styles';
import {useNavigate} from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/material/styles/useTheme';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import Button from '@mui/material/Button';
import {Searchnput} from './SearchInput';
import {BtnGroupType} from '../models/misc';

interface Props {
  btnGroupType?: BtnGroupType;
  searchPlaceholder?: string;
  onSearchTextChanged?: (text: string) => void;
  openMapView?: () => void;
  closeMapView?: () => void;
  mapViewActive?: boolean;
  showFilter: boolean;
  setShowFilter: (state: boolean) => void;
}

export const Widget = ({
  btnGroupType,
  searchPlaceholder,
  onSearchTextChanged,
  openMapView,
  closeMapView,
  mapViewActive,
  showFilter,
  setShowFilter,
}: Props) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box>
      <Box display="flex">
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
            startIcon={<FilterListIcon />}
          >
            <Typography variant="body1" sx={{textTransform: 'capitalize'}}>
              Filter
            </Typography>
          </Button>
        </Box>

        <Box mr={3}>
          <Searchnput
            placeholder={searchPlaceholder}
            onValueChanged={onSearchTextChanged}
          />
        </Box>
        <Box>
          <ButtonGroup variant="outlined" size="small" sx={{height: 48}}>
            {btnGroupType && btnGroupType === BtnGroupType.ICON ? (
              <>
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
                  }}
                >
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
                  variant="outlined"
                >
                  <GridViewIcon />
                </Button>
              </>
            ) : (
              <>
                <Button
                  disableRipple
                  variant="outlined"
                  size={theme.breakpoints.down('md') ? 'small' : undefined}
                  onClick={() => (closeMapView ? closeMapView() : () => {})}
                  sx={{
                    background: !mapViewActive
                      ? theme.palette.action.selected
                      : '#fff',
                  }}
                >
                  <Typography
                    variant="largeBtnText"
                    sx={{textTransform: 'capitalize'}}
                  >
                    List View
                  </Typography>
                </Button>

                <Button
                  disableRipple
                  size={theme.breakpoints.down('md') ? 'small' : undefined}
                  variant="outlined"
                  sx={{
                    background: mapViewActive
                      ? theme.palette.action.selected
                      : '#fff',
                  }}
                  onClick={() => (openMapView ? openMapView() : () => {})}
                >
                  <Typography
                    variant="largeBtnText"
                    sx={{textTransform: 'capitalize'}}
                  >
                    Map View
                  </Typography>
                </Button>
              </>
            )}
          </ButtonGroup>
        </Box>
      </Box>
    </Box>
  );
};
