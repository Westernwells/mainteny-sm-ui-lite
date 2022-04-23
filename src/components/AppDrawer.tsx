import React, {useEffect, useState} from 'react';
import {Theme, CSSObject} from '@mui/material/styles';
import styled from '@mui/material/styles/styled';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Elevator from '@mui/icons-material/Elevator';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
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
import Fade from '@mui/material/Fade';

const drawerWidth = '12.5rem';

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

const DrawerHeader = styled('div')(({theme}) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginLeft: theme.spacing(4),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({theme, open}) => ({
  minWidth: 50,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
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
  const [selectedIndex, setSelectedIndex] = useState(0);
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
      text: 'Customers',
      icon: <PeopleAltIcon sx={{color: '#fff'}} />,
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
      text: 'Employees',
      icon: <WorkOutlinedIcon sx={{color: '#fff'}} />,
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
        navigate('/orders?pageIndex=1&pageSize=25');
      },
    },
  ];

  return (
    <Box sx={{display: 'flex'}}>
      <Drawer
        variant="permanent"
        open={open}
        PaperProps={{
          sx: {
            paddingTop: 10,
            color: '#fff',
          },
        }}>
        <DrawerHeader>
          {open ? (
            <>
              <IconButton onClick={handleDrawerClose} edge="start" sx={{}}>
                <ArrowBackIosNewIcon />
              </IconButton>
              <IconButton
                aria-label="open drawer"
                onClick={handleDrawerClose}
                edge="start"
                sx={{fontSize: ''}}>
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{}}>
                <MenuIcon />
              </IconButton>

              <IconButton onClick={handleDrawerOpen} edge="start" sx={{}}>
                <ArrowForwardIos />
              </IconButton>
            </>
          )}
        </DrawerHeader>
        <List>
          {drawerList.map(({text, icon, onClick, path}, index) => (
            <ListItemButton
              onClick={(e) => onClick(e, index)}
              selected={!!selectedPath.includes(path)}
              style={{
                borderTopLeftRadius: '6px',
                borderBottomLeftRadius: '6px',

                paddingTop: 15,
                paddingBottom: 15,
                ...(index !== selectedIndex
                  ? {
                      borderLeft: '8px',
                      borderLeftStyle: 'solid',
                      borderColor: 'rgba(9, 83, 105, 0)',
                    }
                  : null),
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
