/* eslint-disable */
import {ReactNode} from 'react';
import Box from '@mui/material/Box';
import MuiTabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {BackAction} from './BackAction';
import {MenuBtnProps} from 'models/misc';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';
import {Button} from './Button';
import {MenuBtn} from './MenuBtn';

interface TabItems {
  label: string;
  icon: JSX.Element;
}

interface Props {
  children: ReactNode;
  tabItems: TabItems[];
  backBtnLabel?: string;
  onChange?: (tabIndex: number) => void;
  currentIndex?: number;
  hideBackIcon?: boolean;
  renderWidget?: JSX.Element | null;
  pageTitle?: string;
  tabStyle?: {[key: string]: string | number};
  label?: string;
  showActionBtn?: boolean;
  showMenuActionBtn?: Boolean;
  btnLabel?: string;
  btnOnClick?: () => void;
  containerStyles?: {[key: string]: string | number};
  menu?: MenuBtnProps[];
  actionButtonIcon?: JSX.Element;
  actionBtnVariant?: 'contained' | 'outlined' | 'text';
}

const a11yProps = (index: number) => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});

export const Tabs = ({
  children,
  tabItems,
  hideBackIcon,
  renderWidget = null,
  pageTitle,
  onChange = () => {},
  backBtnLabel = '',
  currentIndex = 0,
  tabStyle,
  showActionBtn = false,
  btnLabel = '',
  btnOnClick,
  containerStyles,
  showMenuActionBtn,
  menu,
  actionButtonIcon,
  actionBtnVariant,
}: Props) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pb: '1em',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          height: '2.5rem',
        }}>
        {!hideBackIcon ? (
          <BackAction label={backBtnLabel} containerStyle={{mr: '3em'}} />
        ) : null}
        {pageTitle ? (
          <Typography
            component="div"
            variant="h5"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
            {pageTitle}
          </Typography>
        ) : null}

        {showActionBtn ? (
          <Button
            label="Filter"
            buttonProps={{
              onClick: () => (btnOnClick ? btnOnClick() : () => {}),
              sx: {
                textTransform: 'capitalize',
                ml: '0.8em',
                height: '100%',
              },
              variant: actionBtnVariant || 'contained',
              color: 'primary',
              size: 'small',
              startIcon: actionButtonIcon || <AddIcon />,
            }}>
            <Typography variant="body1" sx={{textTransform: 'capitalize'}}>
              {btnLabel}
            </Typography>
          </Button>
        ) : null}

        {showMenuActionBtn && menu ? (
          <MenuBtn
            startIcon={actionButtonIcon || <AddIcon />}
            label={btnLabel}
            menu={menu}
            size="medium"
            color="primary"
            sx={{
              textTransform: 'capitalize',
              ml: '0.8em',
              py: '0.7em',
              height: '100%',
            }}
            variant={actionBtnVariant || 'contained'}
            disableRipple
            disableFocusRipple
          />
        ) : null}
      </Box>
      <MuiTabs
        sx={{
          '& .MuiTabs-indicator': {
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          },
          ...tabStyle,
        }}
        value={currentIndex}
        onChange={(e: any, newValue: number) => {
          if (onChange) {
            onChange(newValue);
          }
        }}
        textColor="secondary">
        {tabItems.map((item, index) => (
          <Tab
            key={`${item.label}`}
            disableRipple
            label={
              <Box
                display="flex"
                className="item-label"
                sx={{
                  position: 'relative',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    borderRadius: '3px',
                    width: '124px',
                    height: '3px',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  },
                }}>
                <Box className="item-icon">{item.icon}</Box>
                <Typography mb={1} sx={{ml: 1}} variant="subtitle1">
                  {item.label}
                </Typography>
              </Box>
            }
            sx={{
              height: 30,
              textTransform: 'capitalize',
              '&.MuiTab-root': {
                pl: 0,
              },
              '&.MuiTab-textColorPrimary': {
                color: theme.palette.primary.main,
              },
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                '& .item-label': {
                  '&::before': {
                    backgroundColor: theme.palette.primary.main,
                  },
                  '& .item-icon': {
                    color: theme.palette.secondary.main,
                  },
                },
              },
            }}
            {...a11yProps(index)}
          />
        ))}
      </MuiTabs>
      <Divider light sx={{mt: '-0.5em', mb: '1em'}} />
      {renderWidget}

      <Box
        sx={{
          width: '100%',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',

          '::-webkit-scrollbar': {
            width: 0,
            background: 'transparent',
          },
        }}>
        {children}
      </Box>
    </Box>
  );
};
