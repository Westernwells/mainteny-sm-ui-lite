import {useState} from 'react';
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  PopoverOrigin,
  Tooltip,
  Typography,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import MoreIcon from '@mui/icons-material/MoreVert';

interface Action {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
  disabled?: boolean;
}

interface Props {
  actions?: Action[];
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  disabled?: boolean;
  hideTooltip?: boolean;
}

const DEFAULT_ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: 'bottom',
  horizontal: 'left',
};
const DEFAULT_TRANSFORM_ORIGIN: PopoverOrigin = {
  vertical: 'top',
  horizontal: 'center',
};

export const ThreeDotMenu = ({
  hideTooltip = false,
  actions = [],
  anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
  transformOrigin = DEFAULT_TRANSFORM_ORIGIN,
  disabled = false,
}: Props) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (currentTarget: HTMLButtonElement) => {
    setAnchorEl(currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderButton = () => (
    <IconButton
      data-role="menu"
      disabled={disabled}
      onClick={(e) => handleClick(e.currentTarget)}>
      <MoreIcon fontSize="small" sx={{color: 'action.active'}} />
    </IconButton>
  );

  return (
    <>
      {!hideTooltip ? (
        <Tooltip title={t('More')} placement="right" arrow>
          {renderButton()}
        </Tooltip>
      ) : (
        renderButton()
      )}
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
          sx: {width: '210px'},
        }}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}>
        {actions.map((item, index) => (
          <Box key={`${item.label}-${index}`}>
            {(actions.length > 3 && actions.length - 3 < index) ||
            (actions.length <= 3 && actions.length - 1 === index) ? (
              <Divider />
            ) : null}
            <MenuItem
              onClick={() => {
                item.onClick();
                handleClose();
              }}
              disabled={item.disabled}
              sx={{py: '0.7rem'}}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>
                <Typography variant="body2">{item.label}</Typography>
              </ListItemText>
            </MenuItem>
          </Box>
        ))}
      </Menu>
    </>
  );
};
