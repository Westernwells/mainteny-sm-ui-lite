import {ReactNode} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import {MenuBtnProps} from 'models/misc';
import {SearchInput} from './SearchInput';
import {MenuBtn} from './MenuBtn';
import {Button} from './Button';

interface Props {
  searchPlaceholder?: string;
  hideSearchInput?: boolean;
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
  showActionBtn = false,
  hideSearchInput = false,
  btnLabel = '',
  getSearchValue,
  btnOnClick,
  containerStyles,
  showMenuActionBtn,
  menu,
  filterItems,
}: Props) => (
  <Box display="flex" sx={{height: '2.5rem', flexGrow: 1, ...containerStyles}}>
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

    {(showActionBtn || (showMenuActionBtn && menu)) && (
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
    )}
  </Box>
);
