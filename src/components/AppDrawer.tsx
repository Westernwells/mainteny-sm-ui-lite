import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import {ClickAwayListener} from '@mui/material';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import MuiDrawer from '@mui/material/Drawer';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {CSSObject, Theme} from '@mui/material/styles';
import styled from '@mui/material/styles/styled';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import {ReactComponent as CustomerCenterIcon} from 'assets/icons/CustomerCenter.svg';
import {ReactComponent as CustomerCenterIconColor} from 'assets/icons/CustomerCenterColor.svg';
import {ReactComponent as DashboardIcon} from 'assets/icons/Dashboard.svg';
import {ReactComponent as DashboardIconColor} from 'assets/icons/DashboardIconColor.svg';
import {ReactComponent as FinanceIcon} from 'assets/icons/FinanceIcon.svg';
import {ReactComponent as FinanceIconColor} from 'assets/icons/FinanceIconColor.svg';
import {ReactComponent as InventoryIcon} from 'assets/icons/InventoryIcon.svg';
import {ReactComponent as InventoryIconColor} from 'assets/icons/InventoryIconColor.svg';
import {ReactComponent as JobsIcon} from 'assets/icons/Jobs.svg';
import {ReactComponent as JobsIconColor} from 'assets/icons/JobsIconColor.svg';
import {ReactComponent as Logo} from 'assets/icons/Logo.svg';
import {ReactComponent as MaintenyLogoWhite} from 'assets/icons/MaintenyLogoWhite.svg';
import {ReactComponent as MyCompanyIcon} from 'assets/icons/MyCompanyIcon.svg';
import {ReactComponent as MyCompanyIconColor} from 'assets/icons/MyCompanyIconColor.svg';
import {ReactComponent as SettingsIcon} from 'assets/icons/Settings.svg';
import {ReactComponent as SettingsIconColor} from 'assets/icons/SettingsIconColor.svg';
import {ReactComponent as CompanyIcon} from 'assets/icons/Company.svg';
import {ReactComponent as CompanyIconColor} from 'assets/icons/CompanyIconColor.svg';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Role} from 'models/user';
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation, useNavigate} from 'react-router-dom';
import {lowerCaseAndJoinByHyphen} from 'utils/utils';

function checkPath(
  selectedPath: string | string[],
  currentPath: string,
): boolean {
  const paths: string[] = Array.isArray(selectedPath)
    ? selectedPath
    : [selectedPath];

  const parsePath = (
    path: string,
  ): {basePath: string; params: URLSearchParams} => {
    const [basePath, queryString] = path.split('?');
    const params = new URLSearchParams(queryString || '');
    return {basePath, params};
  };

  const {basePath: currentBasePath, params: currentParams} =
    parsePath(currentPath);

  return paths.some((path) => {
    const {basePath, params} = parsePath(path);

    if (basePath !== currentBasePath) return false;

    if ([...params.keys()].length !== [...currentParams.keys()].length) {
      return false;
    }

    if (
      ![...params.entries()].every(
        ([key, value]) => currentParams.get(key) === value,
      )
    ) {
      return false;
    }

    return true;
  });
}

const drawerWidth = '17.5rem';

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
  width: '81px',
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

const THESUBLISTS = {
  jobs: ['list', 'schedule'],
  finance: ['invoices', 'quotations', 'purchase invoices'],
  'customer center': ['units', 'customers', 'contracts', 'contacts'],
  'my company': ['employees', 'exports'],
  inventory: ['articles'],
};

const THESUBLISTSKEYS = Object.keys(THESUBLISTS);
const THESUBLISTSVALUES = Object.values(THESUBLISTS);

export const AppDrawer = ({open, setOpen}: Props) => {
  const {t} = useTranslation();
  const themeX = useTheme();
  const setSelectedIndex = useState(0)[1];
  const [selectedPath, setSelectedPath] = useState('/');
  const [selectedPathOrigin, setSelectedPathOrigin] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const {user} = useUserSession();

  const [openedNests, setOpenedNests] = useState<string[]>([]);

  const handleNestControl = (nestName: string, variant?: string) => {
    let prevNests = [...openedNests];
    if (prevNests.includes(nestName)) {
      if (variant && variant === 'other') {
        prevNests = prevNests.filter(
          (item) => item.toLocaleLowerCase() !== nestName.toLocaleLowerCase(),
        );
      } else {
        return;
      }
    } else {
      prevNests.push(nestName);
    }

    setOpenedNests(prevNests);
  };

  useEffect(() => {
    const thePath = location.pathname.split('/')[1];
    const theQuery = location.search;
    const fullPath = `/${thePath}${theQuery}`;
    setSelectedPath(fullPath);

    const ordersPaths = ['orders?tab=0', 'orders?tab=1', 'orders'];
    const isOrdersPath = ordersPaths.some((path) => fullPath.includes(path));

    if (isOrdersPath) {
      setSelectedPathOrigin('jobs');
      return;
    }
    for (let i = 0; i < THESUBLISTSKEYS.length; i += 1) {
      if (THESUBLISTSVALUES[i].includes(thePath)) {
        setSelectedPathOrigin(THESUBLISTSKEYS[i]);
        return;
      }
    }
  }, [location.pathname, location.search]);

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
        setSelectedPathOrigin('');
        navigate('/');
      },
    },
    {
      text: 'Jobs',
      icon: <JobsIcon fontSize="1.5rem" style={{color: '#F5FDFE'}} />,
      selectIcon: <JobsIconColor fontSize="1.5rem" />,
      path: '/orders',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();

        setSelectedIndex(index);
        handleNestControl('jobs', 'other');
        setSelectedPath('/orders');
        navigate('/orders');
      },

      subList: [
        {
          text: 'List',
          path: ['/orders', '/orders?tab=0'],
          access: !isAdmin,
          onClick: (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
          ) => {
            e.preventDefault();

            setSelectedIndex(index);
            setSelectedPath('/orders');
            navigate('/orders');
          },
        },
        {
          text: 'Schedule',
          path: '/orders?tab=1',
          access: !isAdmin,
          onClick: (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
          ) => {
            e.preventDefault();

            setSelectedIndex(index);
            setSelectedPath('/orders?tab=1');
            navigate('/orders?tab=1');
          },
        },
      ],
    },
    {
      text: 'Customer Center',
      icon: <CustomerCenterIcon fontSize="1.5rem" />,
      selectIcon: <CustomerCenterIconColor fontSize="1.5rem" />,
      path: '',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();

        setSelectedIndex(index);
        handleNestControl('customer center', 'other');
        setSelectedPath('/units');
        navigate('/units');
      },

      subList: [
        {
          text: 'Units',
          path: '/units',
          access: !isAdmin,
          onClick: (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
          ) => {
            e.preventDefault();

            setSelectedIndex(index);
            setSelectedPath('/units');
            navigate('/units');
          },
        },
        {
          text: 'Customers',
          path: '/customers',
          access: !isAdmin,
          onClick: (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
          ) => {
            e.preventDefault();

            setSelectedIndex(index);
            setSelectedPath('/customers');
            navigate('/customers');
          },
        },
        {
          text: 'Contracts',
          path: '/contracts',
          access: !isAdmin,
          onClick: (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
          ) => {
            e.preventDefault();

            setSelectedIndex(index);
            setSelectedPath('/contracts');
            navigate('/contracts');
          },
        },
        {
          text: 'Contacts',
          path: '/contacts',
          access: !isAdmin,
          onClick: (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
          ) => {
            e.preventDefault();

            setSelectedIndex(index);
            setSelectedPath('/contacts');
            navigate('/contacts');
          },
        },
      ],
    },
    {
      text: 'Finance',
      icon: <FinanceIcon fontSize="1.5rem" />,
      selectIcon: <FinanceIconColor fontSize="1.5rem" />,
      path: '/invoices',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();

        setSelectedIndex(index);
        handleNestControl('finance', 'other');
        setSelectedPath('/invoices');
        navigate('/invoices');
      },

      subList: [
        {
          text: 'Invoices',
          path: '/invoices',
          access: !isAdmin,
          onClick: (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
          ) => {
            e.preventDefault();

            setSelectedIndex(index);
            setSelectedPath('/invoices');
            navigate('/invoices');
          },
        },
        {
          text: 'Quotations',
          path: '/quotations',
          access: !isAdmin,
          onClick: (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
          ) => {
            e.preventDefault();

            setSelectedIndex(index);
            setSelectedPath('/quotations');
            navigate('/quotations');
          },
        },
      ],
    },

    {
      text: 'Inventory',
      icon: <InventoryIcon fontSize="1.5rem" />,
      selectIcon: <InventoryIconColor fontSize="1.5rem" />,
      path: '',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();

        setSelectedIndex(index);
        handleNestControl('inventory', 'other');
        setSelectedPath('/articles');
        navigate('/articles');
      },

      subList: [
        {
          text: 'Articles & Suppliers',
          path: '/articles',
          access: !isAdmin,
          onClick: (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
          ) => {
            e.preventDefault();

            setSelectedIndex(index);
            setSelectedPath('/articles');
            navigate('/articles');
          },
        },
      ],
    },
    {
      text: 'My Company',
      icon: <MyCompanyIcon fontSize="1.5rem" />,
      selectIcon: <MyCompanyIconColor fontSize="1.5rem" />,
      path: '',
      access: !isAdmin,
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();

        setSelectedIndex(index);
        handleNestControl('my company', 'other');
        setSelectedPath('/employees');
        navigate('/employees');
      },

      subList: [
        {
          text: 'Employees',
          path: '/employees',
          access: !isAdmin,
          onClick: (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
          ) => {
            e.preventDefault();

            setSelectedIndex(index);
            setSelectedPath('/employees');
            navigate('/employees');
          },
        },
        {
          text: 'Exports',
          path: '/exports',
          access: !isAdmin,
          onClick: (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
          ) => {
            e.preventDefault();

            setSelectedIndex(index);
            setSelectedPath('/exports');
            navigate('/exports');
          },
        },
      ],
    },

    {
      text: 'Settings',
      icon: <SettingsIcon fontSize="1.5rem" />,
      selectIcon: <SettingsIconColor fontSize="1.5rem" />,
      path: isAdmin ? '/admin/system-settings' : '/settings',
      access: isAdmin || (!isAdmin && isManager),
      onClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
      ) => {
        e.preventDefault();
        setSelectedIndex(index);
        if (isAdmin) {
          setSelectedPath('/admin/system-settings');
          navigate('/admin/system-settings');
        } else {
          setSelectedPath('/settings');
          setSelectedPathOrigin('');
          navigate('/settings');
        }
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
        navigate('/admin/companies');
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
              handleDrawerClose();
              navigate('/');
            }}>
            <MaintenyLogoWhite width={150} height={30} />
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
              (
                {text, icon, selectIcon, onClick, path, access, subList},
                index,
              ) => {
                if (!access) return null;
                return (
                  <Fragment key={text}>
                    <ListItemButton
                      onClick={(e) => onClick(e, index)}
                      selected={
                        checkPath(path, selectedPath) ||
                        text.toLocaleLowerCase() === selectedPathOrigin
                      }
                      sx={{
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: open ? 'start' : 'center',
                        paddingLeft: open ? '24px' : '20px',
                        paddingRight: open ? '24px' : '20px',
                        gap: '12px',

                        transition: (theme) =>
                          theme.transitions.create('margin', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                          }),
                        color:
                          checkPath(path, selectedPath) ||
                          text.toLocaleLowerCase() === selectedPathOrigin
                            ? '#FFF'
                            : '#8F9BB3',

                        '&:hover': {
                          background: '#40748054',
                          color: '#FFF',
                          '.MuiListItemIcon-root > svg > g': {
                            opacity: 1.0,
                          },
                        },
                        '&.Mui-selected': {
                          background: 'transparent',
                          boxSizing: 'border-box',
                          borderLeft: open
                            ? '0px solid transparent'
                            : '4px solid #00D1FF',
                          borderRight: open
                            ? '0px solid transparent'
                            : '4px solid transparent',

                          '&:hover': {
                            background: open ? 'transparent' : '#40748054',
                            borderLeft: open
                              ? '0px solid transparent'
                              : '4px solid #00D1FF',
                            borderRight: open
                              ? '0px solid transparent'
                              : '4px solid transparent',
                          },
                        },
                      }}
                      key={text}
                      data-testid={`${lowerCaseAndJoinByHyphen(
                        text,
                      )}-nav-item`}>
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                        }}>
                        {checkPath(path, selectedPath) ||
                        text.toLocaleLowerCase() === selectedPathOrigin
                          ? selectIcon
                          : icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Fade in={open}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '4px',
                              }}>
                              <Box
                                onClick={(e) => onClick(e, index)}
                                sx={{
                                  flex: '1 1 0%',
                                }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}>
                                  {t(text)}
                                </Typography>
                              </Box>
                              {!!subList && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNestControl(
                                      text.toLocaleLowerCase(),
                                      'other',
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    e.stopPropagation();
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      handleNestControl(
                                        text.toLocaleLowerCase(),
                                        'other',
                                      );
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}>
                                  {openedNests.includes(
                                    text.toLocaleLowerCase(),
                                  ) ? (
                                    <ExpandMore />
                                  ) : (
                                    <ExpandLess />
                                  )}
                                </div>
                              )}
                            </Box>
                          </Fade>
                        }
                      />
                    </ListItemButton>
                    {!!subList && (
                      <Collapse
                        in={
                          open && openedNests.includes(text.toLocaleLowerCase())
                        }
                        timeout="auto"
                        unmountOnExit>
                        <List component="div" disablePadding>
                          {subList.map((list, listIndex) => (
                            <ListItemButton
                              onClick={(e) => list.onClick(e, listIndex)}
                              selected={checkPath(list.path, selectedPath)}
                              sx={{
                                borderLeft: 'solid 2px #8F9BB3',
                                background: 'transparent',
                                paddingTop: '2px',
                                paddingBottom: '2px',
                                paddingLeft: '12px',
                                paddingRight: '0px',
                                height: '44px',
                                marginLeft: '35.5px',
                                marginRight: '24px',

                                '&.Mui-selected': {
                                  background: 'transparent',
                                  boxSizing: 'border-box',
                                  borderLeft: '2px solid #00D1FF',

                                  '&:hover': {
                                    background: 'transparent',
                                    borderLeft: '2px solid #00D1FF',
                                  },
                                },
                                '&:hover': {
                                  background: 'transparent',
                                  borderLeft: 'solid 2px #8F9BB3',
                                  color: '#FFF',
                                  '.MuiListItemIcon-root > svg > g': {
                                    opacity: 1.0,
                                  },
                                },
                              }}
                              key={list.text}
                              data-testid={`${lowerCaseAndJoinByHyphen(
                                list.text,
                              )}-nav-item`}>
                              <ListItemText
                                primary={
                                  <Fade in={open}>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{
                                        pl: 1,
                                        pr: 1,
                                        pt: 0.75,
                                        pb: 0.75,
                                        borderRadius: '4px',
                                        backgroundColor: checkPath(
                                          list.path,
                                          selectedPath,
                                        )
                                          ? '#40748054'
                                          : 'transparent',
                                        color: checkPath(
                                          list.path,
                                          selectedPath,
                                        )
                                          ? '#FFF'
                                          : '#8F9BB3',
                                        '&:hover': {
                                          background: '#40748054',
                                          color: '#FFF',
                                          '.MuiListItemIcon-root > svg > g': {
                                            opacity: 1.0,
                                          },
                                        },
                                      }}>
                                      {t(list.text)}
                                    </Typography>
                                  </Fade>
                                }
                              />
                            </ListItemButton>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </Fragment>
                );
              },
            )}
          </List>
        </Drawer>
      </ClickAwayListener>
    </Box>
  );
};
