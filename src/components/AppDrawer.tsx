import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
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
import HomeIcon from '@mui/icons-material/Home';
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
import {Settings} from '@mui/icons-material';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import {ReactComponent as Logo} from 'assets/icons/Logo.svg';
import {ReactComponent as MaintenyLogo} from 'assets/icons/Mainteny.svg';
import Fade from '@mui/material/Fade';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Role} from 'models/user';

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
  const {t} = useTranslation();
  const [open, setOpen] = useState(false);
  const themeX = useTheme();
  const setSelectedIndex = useState(0)[1];
  const [selectedPath, setSelectedPath] = useState('/');
  const location = useLocation();
  const navigate = useNavigate();
  const {user} = useUserSession();

  useEffect(() => {
    setSelectedPath(location.pathname);
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const isAdmin = user?.userAccount.roles.includes(Role.ADMIN);
  const isManager = user?.userAccount.roles.includes(Role.SERVICE_MANAGER);

  const drawerList = [
    {
      text: 'Home',
      icon: <HomeIcon sx={{color: '#fff'}} />,
      path: '/',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_HOME_CLICKED);
        navigate('/');
      },
    },
    {
      text: 'Orders',
      icon: <LocalShippingIcon sx={{color: '#fff'}} />,
      path: '/orders',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/orders');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_ORDERS_CLICKED);
        navigate('/orders');
      },
    },
    {
      text: 'Units',
      icon: <Elevator sx={{color: '#fff'}} />,
      path: '/units',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/units');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_UNITS_CLICKED);
        navigate('/units');
      },
    },
    {
      text: 'Customers',
      icon: <BusinessIcon sx={{color: '#fff'}} />,
      path: '/customers',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/customers');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_CUSTOMERS_CLICKED);
        navigate('/customers');
      },
    },
    {
      text: 'Contracts',
      icon: <FileCopyIcon sx={{color: '#fff'}} />,
      path: '/contracts',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/contracts');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_CONTRACTS_CLICKED);
        navigate('/contracts');
      },
    },
    {
      text: 'Quotations',
      icon: <RequestQuoteIcon sx={{color: '#fff'}} />,
      path: '/quotations',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/quotations');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_QUOTATIONS_CLICKED);
        navigate('/quotations');
      },
    },
    {
      text: 'Invoices',
      icon: <PaymentsIcon sx={{color: '#fff'}} />,
      path: '/invoices',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/invoices');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_INVOICES_CLICKED);
        navigate('/invoices');
      },
    },
    {
      text: 'Articles & Packages',
      icon: <HomeRepairServiceIcon sx={{color: '#fff'}} />,
      path: '/articles',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/articles');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_ARTICLES_CLICKED);
        navigate('/articles');
      },
    },
    {
      text: 'Employees',
      icon: <PeopleAltIcon sx={{color: '#fff'}} />,
      path: '/employees',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/employees');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_EMPLOYEES_CLICKED);
        navigate('/employees');
      },
    },
    {
      text: 'Settings',
      icon: <Settings sx={{color: '#fff'}} />,
      path: '/settings',
      access: !isAdmin && isManager,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/settings');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_SETTINGS_CLICKED);
        navigate('/settings');
      },
    },
    {
      text: 'Companies',
      icon: <CorporateFareIcon sx={{color: '#fff'}} />,
      path: '/admin/companies',
      access: isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/admin/companies');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_COMPANIES_CLICKED);
        navigate('/admin/companies');
      },
    },
    {
      text: 'Settings',
      icon: <Settings sx={{color: '#fff'}} />,
      path: '/admin/system-settings',
      access: isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/admin/system-settings');
        Mixpanel.identifyAndTrack(mixpanelEvents.MENU_SYSTEM_SETTINGS_CLICKED);
        navigate('/admin/system-settings');
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
          <IconButton
            sx={{mr: '1em'}}
            edge="start"
            disableRipple
            onClick={() => {
              setSelectedPath('/');
              Mixpanel.identifyAndTrack(mixpanelEvents.MENU_HOME_CLICKED);
              navigate('/');
            }}>
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
          {drawerList.map(({text, icon, onClick, path, access}, index) => {
            if (!access) return null;
            return (
              <ListItemButton
                onClick={(e) => onClick(e, index)}
                selected={selectedPath === path}
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
                <ListItemIcon sx={{minWidth: 0, pr: '1em', pl: '.25em'}}>
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Fade in={open}>
                      <Typography variant="subtitle1">{t(text)}</Typography>
                    </Fade>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </Box>
  );
};
