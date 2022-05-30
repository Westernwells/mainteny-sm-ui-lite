/* eslint-disable */
import {ReactNode, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FilterListIcon from '@mui/icons-material/FilterList';
import useTheme from '@mui/material/styles/useTheme';
import AddIcon from '@mui/icons-material/Add';
import ToggleButton from '@mui/material/ToggleButton';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {MenuBtnProps} from 'models/misc';
import {SearchInput} from './SearchInput';
import {MenuBtn} from './MenuBtn';
import {Button} from './Button';

interface Props {
  searchPlaceholder?: string;
  // openMapView?: () => void;
  // closeMapView?: () => void;
  showFilter?: boolean;
  setShowFilter?: (state: boolean) => void;
  hideViewOption?: boolean;
  hideSearchInput?: boolean;
  hideFilter?: boolean;
  getSearchValue?: (val: string) => void;
  showActionBtn?: boolean;
  showMenuActionBtn?: Boolean;
  btnLabel?: string;
  btnOnClick?: () => void;
  containerStyles?: {[key: string]: string | number};
  menu?: MenuBtnProps[];
  filterItems?: ReactNode;
}

export const Widget = ({
  searchPlaceholder,
  // openMapView,
  // closeMapView,
  showFilter,
  setShowFilter = () => {},
  hideViewOption = false,
  hideFilter = false,
  showActionBtn = false,
  hideSearchInput = false,
  btnLabel = '',
  getSearchValue,
  btnOnClick,
  containerStyles,
  showMenuActionBtn,
  menu,
  filterItems,
}: Props) => {
  const theme = useTheme();
  const [view, setView] = useState('list');

  return (
    <Box
      display="flex"
      sx={{height: '2.5rem', flexGrow: 1, ...containerStyles}}>
      {!hideSearchInput ? (
        <Box sx={{mr: '1em'}}>
          <SearchInput
            containerStyle={{height: '100%'}}
            placeholder={searchPlaceholder}
            onValueChanged={(value: string) =>
              getSearchValue && getSearchValue(value)
            }
          />
        </Box>
      ) : null}
      {filterItems || null}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          flexGrow: 1,
        }}>
        {showActionBtn ? (
          <Button
            // label="Filter"
            buttonProps={{
              onClick: () => (btnOnClick ? btnOnClick() : () => {}),
              sx: {
                textTransform: 'capitalize',
                ml: '0.8em',
              },
              variant: 'contained',
              color: 'primary',
              size: 'small',
              startIcon: <AddIcon />,
            }}>
            <Typography variant="body1" sx={{textTransform: 'capitalize'}}>
              {btnLabel}
            </Typography>
          </Button>
        ) : null}

        {showMenuActionBtn && menu ? (
          <MenuBtn
            startIcon={<AddIcon />}
            label={btnLabel}
            menu={menu}
            size="large"
            color="primary"
            sx={{
              textTransform: 'capitalize',
              ml: '0.8em',
              py: '0.7em',
            }}
            variant="contained"
            disableRipple
            disableFocusRipple
          />
        ) : null}
      </Box>
    </Box>
  );
};
