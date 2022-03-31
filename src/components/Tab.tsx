import {ReactNode, useState} from 'react';
import Box from '@mui/material/Box';
// import {useNavigate} from 'react-router-dom';
import MuiTabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
// import ArrowBack from '@mui/icons-material/ArrowBack';
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
  getCurrentTabIndex?: (index: number) => void;
}

const a11yProps = (index: number) => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});

export const Tabs = ({
  children,
  tabItems,
  getCurrentTabIndex = () => {},
  backBtnLabel = '',
}: Props) => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  // const navigate = useNavigate();

  return (
    <Box
      sx={{
        pb: '1em',
      }}>
      <Box
        sx={{
          display: 'flex',
          paddingLeft: '35px',
          // maxHeight: '50px'

          // mt: 11,
        }}>
        <BackAction
          label={backBtnLabel}
          containerStyle={{mt: '0.5em', mr: '3em'}}
        />

        <MuiTabs
          sx={{
            '& .MuiTabs-indicator': {
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: 'transparent',
            },
          }}
          value={value}
          onChange={(e: any, newValue: number) => {
            getCurrentTabIndex(newValue);
            setValue(newValue);
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
      </Box>
      <Box
        sx={{
          px: '2.5em',
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
