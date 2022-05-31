import React, {useEffect, useState} from 'react';
import {Theme, CSSObject} from '@mui/material/styles';
import styled from '@mui/material/styles/styled';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import useTheme from '@mui/material/styles/useTheme';
import MuiDrawer from '@mui/material/Drawer';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import Elevator from '@mui/icons-material/Elevator';
import BusinessIcon from '@mui/icons-material/Business';
import IconButton from '@mui/material/IconButton';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import {useLocation, useNavigate} from 'react-router-dom';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PaymentsIcon from '@mui/icons-material/Payments';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import {ReactComponent as Logo} from 'assets/icons/Logo.svg';
import {ReactComponent as MaintenyLogo} from 'assets/icons/Mainteny.svg';
import Fade from '@mui/material/Fade';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
// import {ListItem} from '@mui/material';

const drawerWidth = '15rem';

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({theme, open}) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  position: 'absolute',
  zIndex: 1000,
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

export const AppDrawer = () => {
  const [open, setOpen] = useState(false);
  const themeX = useTheme();
  const setSelectedIndex = useState(0)[1];
  const [selectedPath, setSelectedPath] = useState('/units');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedPath(location.pathname);
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const drawerList = [
    {
      text: 'Units',
      icon: <Elevator sx={{color: '#fff'}} />,
      path: '/units',
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/units');
        navigate('/units?pageIndex=1&pageSize=25');
      },
    },
    {
      text: 'Customers',
      icon: <BusinessIcon sx={{color: '#fff'}} />,
      path: '/customers',
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/customers');
        navigate('/customers?pageIndex=1&pageSize=25');
      },
    },
    {
      text: 'Contracts',
      icon: <FileCopyIcon sx={{color: '#fff'}} />,
      path: '/contracts',
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/contracts');
        navigate('/contracts?pageIndex=1&pageSize=25');
      },
    },

    {
      text: 'Employees',
      icon: <PeopleAltIcon sx={{color: '#fff'}} />,
      path: '/employees',
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/employees');
        navigate('/employees?pageIndex=1&pageSize=25');
      },
    },
    {
      text: 'Quotations',
      icon: <RequestQuoteIcon sx={{color: '#fff'}} />,
      path: '/quotations',
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/quotations');
        navigate('/quotations?pageIndex=1&pageSize=25');
      },
    },
    {
      text: 'Invoices',
      icon: <PaymentsIcon sx={{color: '#fff'}} />,
      path: '/invoices',
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/invoices');
        navigate('/invoices?pageIndex=1&pageSize=25');
      },
    },
    {
      text: 'Orders',
      icon: <LocalShippingIcon sx={{color: '#fff'}} />,
      path: '/orders',
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/orders');
        navigate('/orders?pageIndex=1&pageSize=25&tab=0');
      },
    },
    {
      text: 'Articles & Packages',
      icon: <HomeRepairServiceIcon sx={{color: '#fff'}} />,
      path: '/articles',
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/articles');
        navigate('/articles?pageIndex=1&pageSize=25&tab=0');
      },
    },
  ];

  const drawerHeader = (logo: any, arrowIcon: any) => (
    <>
      {logo}
      <Box
        sx={{
          display: 'none',
          [themeX.breakpoints.down('md')]: {
            display: 'flex',
            marginLeft: (theme) => theme.spacing(4),
            justifyContent: 'flex-end',
          },
        }}>
        <IconButton
          onClick={open ? handleDrawerClose : handleDrawerOpen}
          edge="start"
          sx={{}}>
          {arrowIcon}
        </IconButton>
        <IconButton
          aria-label="open drawer"
          onClick={open ? handleDrawerClose : handleDrawerOpen}
          edge="start"
          sx={{fontSize: ''}}>
          <MenuIcon />
        </IconButton>
      </Box>
    </>
  );

  const renderDrawerHeader = () =>
    open
      ? drawerHeader(
          <IconButton sx={{mr: '1em'}} edge="start">
            <MaintenyLogo
              style={{marginRight: '0.5em'}}
              width={155.22}
              height={32}
            />
          </IconButton>,
          <ArrowBackIosNewIcon />,
        )
      : drawerHeader(
          <IconButton>
            <Logo style={{marginRight: '0.5em'}} width={55.22} height={32} />
          </IconButton>,
          <ArrowForwardIos />,
        );

  return (
    <Box sx={{display: 'flex'}}>
      <Drawer
        onMouseEnter={() => handleDrawerOpen()}
        onMouseLeave={() => handleDrawerClose()}
        variant="permanent"
        open={open}
        PaperProps={{
          sx: {
            paddingTop: 2,
            color: '#fff',
          },
        }}>
        {renderDrawerHeader()}

        <List>
          {drawerList.map(({text, icon, onClick, path}, index) => (
            <ListItemButton
              onClick={(e) => onClick(e, index)}
              selected={!!selectedPath.includes(path)}
              style={{
                paddingTop: 15,
                paddingBottom: 15,
                ...(open
                  ? {
                      marginLeft: '5px',
                      marginRight: '5px',
                    }
                  : null),
              }}
              sx={{
                transition: (theme) =>
                  theme.transitions.create('margin', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                  }),
              }}
              key={text}>
              <ListItemIcon sx={{minWidth: 0, pr: '1em'}}>{icon}</ListItemIcon>
              <ListItemText
                primary={
                  <Fade in={open}>
                    <Typography variant="subtitle1">{text}</Typography>
                  </Fade>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};
