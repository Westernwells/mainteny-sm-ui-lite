import React, {useState} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {Box} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {
  AdminPanelSettingsOutlined,
  CancelOutlined,
  DoneOutlineOutlined,
} from '@mui/icons-material';
import {CompanyStatus} from 'models/company';

export interface IActions {
  onActivate: (id: string, status: CompanyStatus) => void;
  onLiveSwitch: (id: string, status: CompanyStatus) => void;
  onDeactivate: (id: string, status: CompanyStatus) => void;
  onInternalSwitch: (id: string, status: CompanyStatus) => void;
}

interface Props {
  status: CompanyStatus;
  companyId: string;
}

interface ActionButton {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
}

const Actions = ({
  companyId,
  onActivate,
  onLiveSwitch,
  onDeactivate,
  onInternalSwitch,
  status,
}: Props & IActions) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const actionButtons: ActionButton[] = [
    ...((status === CompanyStatus.TRIAL && [
      {
        icon: <DoneOutlineOutlined sx={{color: 'text.secondary'}} />,
        label: 'Switch to Live',
        onClick: () => onLiveSwitch(companyId, CompanyStatus.ACTIVE),
      },
      {
        icon: <AdminPanelSettingsOutlined sx={{color: 'text.secondary'}} />,
        label: 'Switch to Internal',
        onClick: () => onInternalSwitch(companyId, CompanyStatus.INTERNAL),
      },
    ]) ||
      []),
    ...(((status === CompanyStatus.ACTIVE ||
      status === CompanyStatus.INTERNAL ||
      status === CompanyStatus.TRIAL) && [
      {
        icon: <CancelOutlined sx={{color: 'text.secondary'}} />,
        label: 'Deactivate',
        onClick: () => onDeactivate(companyId, CompanyStatus.DEACTIVATED),
      },
    ]) ||
      []),
    ...((status === CompanyStatus.DEACTIVATED && [
      {
        icon: <DoneOutlineOutlined sx={{color: 'text.secondary'}} />,
        label: 'Activate',
        onClick: () => onActivate(companyId, CompanyStatus.ACTIVE),
      },
    ]) ||
      []),
  ];

  return (
    <Box>
      <IconButton
        size="small"
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
        sx={{ml: '.25em'}}>
        <MoreVertIcon
          sx={{color: open ? 'primary.main' : 'action.active'}}
          fontSize="small"
        />
      </IconButton>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          minWidth: '12.5em',
          '& ul[role="menu"]': {
            padding: 0,
          },
          '& li': {
            padding: '0.6em 1em',
          },
          '& li:not(:last-of-type)': {
            borderBottom: '1px solid #e0e0e0',
          },
        }}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            width: 180,
          },
        }}>
        {actionButtons.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              handleClose();
              action.onClick();
            }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
              }}>
              {action.icon}
              <Typography variant="body2">{t(action.label)}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default React.memo(Actions);
