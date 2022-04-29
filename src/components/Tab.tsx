import {ReactNode} from 'react';
import Box from '@mui/material/Box';
import MuiTabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {BackAction} from './BackAction';

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
  renderWidget?: JSX.Element;
  pageTitle?: string;
}

const a11yProps = (index: number) => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});

export const Tabs = ({
  children,
  tabItems,
  hideBackIcon,
  renderWidget,
  pageTitle,
  onChange = () => {},
  backBtnLabel = '',
  currentIndex = 0,
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
        }}>
        <Typography variant="h5" mt="0.5em" mr="3em">
          {pageTitle || ''}
        </Typography>
        {!hideBackIcon ? (
          <BackAction
            label={backBtnLabel}
            containerStyle={{mt: '0.5em', mr: '3em'}}
          />
        ) : null}

        <MuiTabs
          sx={{
            flexGrow: 1,
            '& .MuiTabs-indicator': {
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: 'transparent',
            },
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
                    px: 1,
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
        <Box
          sx={{
            display: 'flex',

            justifyContent: 'flex-end',
          }}>
          {renderWidget || null}
        </Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          mt: 2,
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
