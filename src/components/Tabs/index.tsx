import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import MuiTabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {TabItem} from '../../models/tab';

type Props = {
  tabItems: TabItem[];
  currentIndex: number;
  onChange: (tabIndex: number) => void;
};

const Tabs = ({tabItems, currentIndex, onChange}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <MuiTabs
      sx={{
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
          data-aria-label={`tab-item-${index}`}
          label={
            <Box
              display="flex"
              className="item-label"
              sx={{
                position: 'relative',
                gap: '0.5em',
                p: '0.5em',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  backgroundColor: 'rgba(34, 43, 69, 0.12)',
                  borderRadius: '3px',
                  width: '100%',
                  height: '3px',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                },
              }}>
              {item.iconPosition !== 'end' && (
                <Box className="item-icon">{item.icon}</Box>
              )}
              <Typography variant="subtitle1">{t(item.label)}</Typography>
              {item.iconPosition === 'end' && (
                <Box className="item-icon">{item.icon}</Box>
              )}
            </Box>
          }
          sx={{
            padding: 0,
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
                  '& path': {
                    fill: theme.palette.primary.light,
                  },
                },
              },
            },
          }}
        />
      ))}
    </MuiTabs>
  );
};

export default Tabs;
