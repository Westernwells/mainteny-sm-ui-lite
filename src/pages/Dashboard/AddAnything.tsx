import {MouseEvent, useState, useEffect} from 'react';
import {useNavigate} from 'react-router';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import AddIcon from '@mui/icons-material/Add';
import Elevator from '@mui/icons-material/Elevator';
import People from '@mui/icons-material/People';
import FileCopy from '@mui/icons-material/FileCopy';
import RequestQuote from '@mui/icons-material/RequestQuote';
import Payments from '@mui/icons-material/Payments';
import HomeRepairService from '@mui/icons-material/HomeRepairService';
import AutoAwesomeMosaic from '@mui/icons-material/AutoAwesomeMosaic';
import Engineering from '@mui/icons-material/Engineering';
import SupervisorAccount from '@mui/icons-material/SupervisorAccount';
import Box from '@mui/material/Box';
import Button, {ButtonProps} from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {useCompanyJobTypes} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import {iconMapping} from 'pages/ServiceOrders';

interface Props extends ButtonProps {
  label?: string;
  menu: {
    header: string;
    items: {
      label: string;
      icon: JSX.Element;
      action: (event: MouseEvent<HTMLLIElement>) => void;
    }[];
  }[];
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  anchorIcon?: JSX.Element | null;
  disableIcon?: boolean;
}

export const MenuBtn = ({
  label = '',
  menu,
  startIcon,
  endIcon,
  ...rest
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        startIcon={startIcon}
        endIcon={endIcon}
        onClick={handleClick}
        {...rest}>
        {t(label)}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        PaperProps={{
          style: {
            width: 256,
            maxWidth: '100%',
            marginTop: '0.5em',
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}>
        <MenuList disablePadding>
          {menu.map((menuList, index) => (
            <div key={menuList.header}>
              <MenuItem
                sx={{
                  ...(!!index && {borderTop: '1px solid #e0e0e0'}),
                  py: '0.5em',
                }}>
                <ListItemText
                  primaryTypographyProps={{
                    color: theme.palette.text.secondary,
                    sx: {
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      lineHeight: '1.25rem',
                      letterSpacing: '0.14px',
                    },
                  }}>
                  {t(menuList.header)}
                </ListItemText>
              </MenuItem>
              {menuList.items.map((item) => (
                <MenuItem
                  key={item.label}
                  sx={{
                    py: '0.5em',
                  }}
                  onClick={(e) => {
                    handleClose();
                    item.action(e);
                  }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primaryTypographyProps={{variant: 'body2'}}>
                    {t(item.label)}
                  </ListItemText>
                </MenuItem>
              ))}
            </div>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export const AddAnything = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {user} = useUserSession();
  const {data: jobTypes, isLoading: loading} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );
  const track = (cb: () => void) => {
    cb();
  };

  const [menu, setMenu] = useState([
    {
      header: 'New Job',
      items: [],
    },
    {
      header: 'New',
      items: [
        {
          label: 'Unit_elevator',
          action: () => track(() => navigate('/units/new')),
          icon: <Elevator fontSize="small" />,
        },
        {
          label: 'Customer',
          action: () => track(() => navigate('/customers/new')),
          icon: <People fontSize="small" />,
        },
        {
          label: 'Contract',
          action: () => track(() => navigate('/contracts/new')),
          icon: <FileCopy fontSize="small" />,
        },
        {
          label: 'Quotation',
          action: () => track(() => navigate('/quotations/new')),
          icon: <RequestQuote fontSize="small" />,
        },
        {
          label: 'Invoice',
          action: () => track(() => navigate('/invoices/new')),
          icon: <Payments fontSize="small" />,
        },
        {
          label: 'Article',
          action: () => track(() => navigate('/articles/new')),
          icon: <HomeRepairService fontSize="small" />,
        },
        {
          label: 'Package',
          action: () => track(() => navigate('/articles/newPackage')),
          icon: <AutoAwesomeMosaic fontSize="small" />,
        },
      ],
    },
    {
      header: 'New Employee',
      items: [
        {
          label: 'Technician',
          action: () => track(() => navigate('/employees/new')),
          icon: <Engineering fontSize="small" />,
        },
        {
          label: 'Service Manager',
          action: () => track(() => navigate('/employees/new')),
          icon: <SupervisorAccount fontSize="small" />,
        },
      ],
    },
  ]);

  // Use useEffect to update the menu when jobTypes are loaded
  useEffect(() => {
    if (!loading && jobTypes) {
      const jobTypeMenu = jobTypes.map((jobType) => {
        const IconComponent =
          iconMapping[jobType.icon as keyof typeof iconMapping] ||
          HelpOutlineOutlinedIcon;

        return {
          label:
            serviceOrderTypeToString(jobType.name) === '-'
              ? jobType.name
              : t(serviceOrderTypeToString(jobType.name)),
          action: () =>
            track(() => {
              navigate(`/orders/new?type=${jobType.name}`);
            }),
          icon: <IconComponent fontSize="small" />,
        };
      });

      setMenu((prevMenu) => [
        {
          header: 'New Job',
          items: jobTypeMenu || [],
        },
        ...prevMenu.slice(1),
      ]);
    }
  }, [jobTypes, loading]);

  return (
    <MenuBtn
      startIcon={<AddIcon />}
      label="Add anything"
      menu={menu}
      size="medium"
      color="primary"
      sx={{
        py: '0.7em',
        height: '100%',
        textTransform: 'none',
      }}
      variant="contained"
      disableRipple
      disableFocusRipple
    />
  );
};
