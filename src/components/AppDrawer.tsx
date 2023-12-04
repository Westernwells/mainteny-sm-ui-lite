import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Theme, CSSObject} from '@mui/material/styles';
import styled from '@mui/material/styles/styled';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import useTheme from '@mui/material/styles/useTheme';
import MuiDrawer from '@mui/material/Drawer';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import IconButton from '@mui/material/IconButton';
import {useLocation, useNavigate} from 'react-router-dom';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import {ReactComponent as Logo} from 'assets/icons/Logo.svg';
import {ReactComponent as DashboardIcon} from 'assets/icons/Dashboard.svg';
import {ReactComponent as DashboardIconColor} from 'assets/icons/DashboardIconColor.svg';
import {ReactComponent as JobsIcon} from 'assets/icons/Jobs.svg';
import {ReactComponent as JobsIconColor} from 'assets/icons/JobsIconColor.svg';
import {ReactComponent as UnitsIcon} from 'assets/icons/Units.svg';
import {ReactComponent as UnitsIconColor} from 'assets/icons/UnitsIconColor.svg';
import {ReactComponent as BriefcaseIconActive} from 'assets/icons/briefcaseActive.svg';
import {ReactComponent as BriefcaseIcon} from 'assets/icons/briefcase.svg';
import {ReactComponent as QuotationIcon} from 'assets/icons/Quotation.svg';
import {ReactComponent as QuotationIconColor} from 'assets/icons/QuotationIconColor.svg';
import {ReactComponent as ArticlesIcon} from 'assets/icons/Articles.svg';
import {ReactComponent as ArticlesIconColor} from 'assets/icons/ArticlesIconColor.svg';
import {ReactComponent as EmployeesIcon} from 'assets/icons/Employees.svg';
import {ReactComponent as EmployeesIconColor} from 'assets/icons/EmployeesIconColor.svg';
import {ReactComponent as AnalyticsIcon} from 'assets/icons/Analytics.svg';
import {ReactComponent as AnalyticsIconColor} from 'assets/icons/AnalyticsIconColor.svg';
import {ReactComponent as SettingsIcon} from 'assets/icons/Settings.svg';
import {ReactComponent as SettingsIconColor} from 'assets/icons/SettingsIconColor.svg';
import {ReactComponent as CompanyIcon} from 'assets/icons/Company.svg';
import {ReactComponent as CompanyIconColor} from 'assets/icons/CompanyIconColor.svg';
import {ReactComponent as MaintenyLogoWhite} from 'assets/icons/MaintenyLogoWhite.svg';
import {ReactComponent as AccountingInvoiceMailActive} from 'assets/icons/accounting-invoice-mail-active.svg';
import {ReactComponent as AccountingInvoiceMail} from 'assets/icons/accounting-invoice-mail.svg';
import {ReactComponent as BusinessContractApproveActive} from 'assets/icons/business-contract-approve-active.svg';
import {ReactComponent as BusinessContractApprove} from 'assets/icons/business-contract-approve.svg';
import Fade from '@mui/material/Fade';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Role} from 'models/user';
import {ClickAwayListener} from '@mui/material';

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

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const AppDrawer = ({open, setOpen}: Props) => {
  const {t} = useTranslation();
  const themeX = useTheme();
  const setSelectedIndex = useState(0)[1];
  const [selectedPath, setSelectedPath] = useState('/');
  const location = useLocation();
  const navigate = useNavigate();
  const {user} = useUserSession();

  useEffect(() => {
    setSelectedPath(`/${location.pathname.split('/')[1]}`);
  }, [location.pathname]);

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
      text: 'Dashboard',
      icon: <DashboardIcon fontSize="1.5rem" />,
      selectIcon: <DashboardIconColor fontSize="1.5rem" />,
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
      text: 'Jobs',
      icon: <JobsIcon fontSize="1.5rem" />,
      selectIcon: <JobsIconColor fontSize="1.5rem" />,
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
      icon: <UnitsIcon fontSize="1.5rem" />,
      selectIcon: <UnitsIconColor fontSize="1.5rem" />,
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
      icon: <BriefcaseIcon fontSize="1.5rem" />,
      selectIcon: <BriefcaseIconActive fontSize="1.5rem" />,
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
      icon: <BusinessContractApprove fontSize="1.5rem" />,
      selectIcon: <BusinessContractApproveActive fontSize="1.5rem" />,
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
      icon: <QuotationIcon fontSize="1.5rem" />,
      selectIcon: <QuotationIconColor fontSize="1.5rem" />,
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
      icon: <AccountingInvoiceMail fontSize="1.5rem" />,
      selectIcon: <AccountingInvoiceMailActive fontSize="1.5rem" />,
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
      text: 'Articles',
      icon: <ArticlesIcon fontSize="1.5rem" />,
      selectIcon: <ArticlesIconColor fontSize="1.5rem" />,
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
      icon: <EmployeesIcon fontSize="1.5rem" />,
      selectIcon: <EmployeesIconColor fontSize="1.5rem" />,
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
      text: 'Analytics',
      icon: <AnalyticsIcon fontSize="1.5rem" />,
      selectIcon: <AnalyticsIconColor fontSize="1.5rem" />,
      path: '/analytics',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        setSelectedPath('/analytics');
        navigate('/analytics');
      },
    },
    {
      text: 'Settings',
      icon: <SettingsIcon fontSize="1.5rem" />,
      selectIcon: <SettingsIconColor fontSize="1.5rem" />,
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
      icon: <CompanyIcon fontSize="1.5rem" />,
      selectIcon: <CompanyIconColor fontSize="1.5rem" />,
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
      icon: <SettingsIcon fontSize="1.5rem" />,
      selectIcon: <SettingsIconColor fontSize="1.5rem" />,
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
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginLeft: '0.6em',
              marginBottom: '0.5em',
            }}
            edge="start"
            disableRipple
            onClick={() => {
              setSelectedPath('/');
              Mixpanel.identifyAndTrack(mixpanelEvents.MENU_HOME_CLICKED);
              navigate('/');
            }}>
            <MaintenyLogoWhite width={118.43} height={24} />
          </IconButton>,
          <ArrowBackIosNewIcon />,
        )
      : drawerHeader(
          <IconButton
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '0.5em',
            }}>
            <Logo width={55.22} height={24} />
          </IconButton>,
          <ArrowForwardIos />,
        );

  return (
    <Box sx={{display: 'flex', zIndex: 1000}}>
      <ClickAwayListener onClickAway={handleDrawerClose}>
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
            {drawerList.map(
              ({text, icon, selectIcon, onClick, path, access}, index) => {
                if (!access) return null;
                return (
                  <ListItemButton
                    onClick={(e) => onClick(e, index)}
                    selected={selectedPath === path}
                    style={{
                      paddingTop: 12,
                      paddingBottom: 12,
                    }}
                    sx={{
                      transition: (theme) =>
                        theme.transitions.create('margin', {
                          easing: theme.transitions.easing.sharp,
                          duration: theme.transitions.duration.leavingScreen,
                        }),
                      color: selectedPath === path ? '#FFF' : '#8F9BB3',
                      '&:hover': {
                        background: '#40748054',
                        color: '#FFF',
                      },
                    }}
                    key={text}>
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: '12px',
                        ml:
                          open && selectedPath === path
                            ? '0px'
                            : open && selectedPath !== path
                            ? '4px'
                            : !open && selectedPath === path
                            ? '0px'
                            : !open && selectedPath !== path
                            ? '4px'
                            : '0px',
                      }}>
                      {selectedPath === path ? selectIcon : icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Fade in={open}>
                          <Typography variant="subtitle1" ml="12px">
                            {t(text)}
                          </Typography>
                        </Fade>
                      }
                    />
                  </ListItemButton>
                );
              },
            )}
          </List>
        </Drawer>
      </ClickAwayListener>
    </Box>
  );
};
