import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {SxProps} from '@mui/system';
import Box from '@mui/material/Box';
import MuiTabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {MenuBtnProps} from 'models/misc';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';
import {Button} from './Button';
import {MenuBtn} from './MenuBtn';

export interface TabItems {
  label: string;
  icon: JSX.Element;
}

interface Props {
  children: ReactNode;
  tabItems: TabItems[];
  onChange?: (tabIndex: number) => void;
  currentIndex?: number;
  renderWidget?: JSX.Element | null;
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
  actionButtonStyles?: SxProps;
  secondaryBtn?: ReactNode;
  backBtnLabel?: string;
  hideBackIcon?: boolean;
  pageTitle?: string;
  hideDivider?: boolean;
  disableBtnAction?: boolean;
}

const a11yProps = (index: number) => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});

export const Tabs = ({
  children,
  tabItems,
  onChange = () => {},
  currentIndex = 0,
  tabStyle,
  showActionBtn = false,
  btnLabel = '',
  btnOnClick,
  showMenuActionBtn,
  menu,
  actionButtonIcon,
  actionBtnVariant,
  actionButtonStyles,
  disableBtnAction,
  secondaryBtn,
}: Props) => {
  const theme = useTheme();

  const renderActionButtons = () => {
    const {t} = useTranslation();
    return (
      <Box
        sx={{
          display: showActionBtn || showMenuActionBtn || menu ? 'flex' : 'none',
          justifyContent: 'space-between',
          height: '2.5rem',
          // mb: '0.5em'
        }}>
        {showActionBtn ? (
          <Button
            label="Filter"
            disabled={disableBtnAction}
            buttonProps={{
              onClick: () => (btnOnClick ? btnOnClick() : () => {}),
              sx: {
                textTransform: 'inherit',
                ml: '0.8em',
                height: '100%',
                ...actionButtonStyles,
              },
              variant: actionBtnVariant || 'contained',
              color: 'primary',
              size: 'small',
              startIcon: actionButtonIcon || <AddIcon />,
            }}>
            <Typography variant="body1" sx={{textTransform: 'inherit'}}>
              {t(btnLabel)}
            </Typography>
          </Button>
        ) : null}

        {secondaryBtn}

        {showMenuActionBtn && menu ? (
          <MenuBtn
            startIcon={actionButtonIcon || <AddIcon />}
            label={btnLabel}
            menu={menu}
            size="medium"
            color="primary"
            sx={{
              textTransform: 'inherit',
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
    );
  };

  const renderTabItems = () => {
    const {t} = useTranslation();
    return (
      <MuiTabs
        sx={{
          flexGrow: 1,
          '& .MuiTabs-flexContainer': {
            columnGap: '0.75em',
            flexWrap: 'wrap',
          },
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
            data-aria-label={`tab-item-${index}`}
            label={
              <Box
                display="flex"
                className="item-label"
                sx={{
                  position: 'relative',
                  gap: '0.5em',
                  p: '0.25em',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    borderRadius: '3px',
                    width: '100%',
                    height: '3px',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  },
                }}>
                <Box className="item-icon">{item.icon}</Box>
                <Typography variant="subtitle1">{t(item.label)}</Typography>
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
        <Divider
          sx={{
            flexBasis: '100%',
            border: `0.5px solid ${theme.palette.action.disabledBackground}`,
            mt: '-0.5em',
            mb: '1em',
          }}
        />
      </MuiTabs>
    );
  };

  return (
    <Box
      sx={{
        pb: '1em',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}>
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        {renderTabItems()}
        {renderActionButtons()}
      </Box>

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
