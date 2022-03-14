import {useState, SyntheticEvent} from 'react';
import Box from '@mui/material/Box';
import {useParams, useNavigate} from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ElevatorIcon from '@mui/icons-material/Elevator';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ArrowBack from '@mui/icons-material/ArrowBack';
import useTheme from '@mui/material/styles/useTheme';
import {elevator, maintainers} from './dummyData';
// import {
//   useElevatorById,
//   useElevatorMaintainers,
// } from 'hooks/reactQuery/useElevator';
// import {useServiceOrders} from '../../hooks/reactQuery/useServiceOrder';
import {OverviewTab} from './Tabs/OverviewTab';
import {ServiceHistoryTab} from './Tabs/ServiceHistoryTab';

const pageSize = 10;

const useStyles = makeStyles(() => {
  const theme = useTheme();
  return {
    tabs: {
      '& .MuiTabs-indicator': {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      },
    },
    tab: {
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
    },
  };
});

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Visit Preferences',
    icon: <ElevatorIcon />,
  },
  {
    label: 'Service History',
    icon: <EngineeringOutlinedIcon />,
  },
  {
    label: 'Performance',
    icon: <GraphicEqIcon />,
  },
];

const a11yProps = (index: number) => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});

export const UnitsDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const classes = useStyles();
  const {id: elevatorId} = useParams();
  const [value, setValue] = useState(0);
  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  console.log(elevatorId, pageSize);
  // TODO: user reactQuery hooks to fetch data
  // const {data: elevator} = useElevatorById(elevatorId);

  // const {data: serviceOrder = createEmptyResource<ServiceOrderView>(pageSize)} =
  //   useServiceOrders({
  //     elevatorIds: elevatorId,
  //     start: toRestDateTime(startOfDay(new Date())),
  //     end: toRestDateTime(endOfMonth(new Date())),
  //     pageSize: 4,
  //     pageIndex: 0,
  //     query: '',
  //   });

  // const {data: maintainers = []} = useElevatorMaintainers(elevatorId);

  const tabPanel = () => {
    switch (value) {
      case 0:
        return <OverviewTab elevator={elevator} maintainers={maintainers} />;
      case 2:
        return <ServiceHistoryTab />;

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        pb: '1em',
      }}>
      <Box
        sx={{
          display: 'flex',
          paddingTop: 2,
          paddingLeft: '35px',
          mt: 10,
        }}>
        <ArrowBack
          onClick={() => navigate(-1)}
          sx={{
            cursor: 'pointer',
            color: theme.palette.text.secondary,
            my: 'auto',
            mr: '40px',
          }}
        />
        <Tabs
          className={classes.tabs}
          value={value}
          onChange={handleChange}
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
              sx={{height: 30, textTransform: 'capitalize'}}
              {...a11yProps(index)}
              className={classes.tab}
            />
          ))}
        </Tabs>
      </Box>
      <Box
        sx={{
          px: 5,
          mt: '1px',
          '::-webkit-scrollbar': {
            width: 0,
            background: 'transparent',
          },
        }}>
        {tabPanel()}
      </Box>
    </Box>
  );
};
