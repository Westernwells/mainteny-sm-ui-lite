import {ReactNode, useState} from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MoreIcon from '@mui/icons-material/MoreVert';
import PreviewIcon from '@mui/icons-material/Preview';
// import CopyAllIcon from '@mui/icons-material/CopyAll';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';
// import DraftsIcon from '@mui/icons-material/Drafts';
import {useTheme} from '@mui/material';

interface ListMenu {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  showBorder?: boolean;
}

interface Props {
  isOpen: boolean;
  isValid: boolean;
  primaryButtonLabel: string;
  primaryButtonAction: () => void;
  listItems: ListMenu[];
  showSecondaryButton?: boolean;
}

export const BottomDrawer = ({
  isOpen,
  isValid,
  primaryButtonLabel,
  primaryButtonAction,
  listItems,
  showSecondaryButton,
}: Props) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Drawer
      PaperProps={{
        sx: {
          background: 'white',
          color: 'primary.main',
          py: '1em',
          zIndex: 'mobileStepper',
        },
      }}
      variant="persistent"
      anchor="bottom"
      open={isOpen}>
      <Box
        display="flex"
        justifyContent="flex-end"
        gap={2}
        sx={{my: 'auto', px: '4em'}}>
        {showSecondaryButton && (
          <Button
            variant="outlined"
            disabled={!isValid}
            startIcon={<PreviewIcon />}
            onClick={() =>
              window.open(
                `${process.env.REACT_APP_BASE_URL}/QuotationPDF.pdf`,
                '_blank',
              )
            }>
            preview
          </Button>
        )}
        <ButtonGroup variant="contained">
          <Button
            type="submit"
            disabled={!isValid}
            onClick={primaryButtonAction}>
            {primaryButtonLabel}
          </Button>
          {listItems.length > 0 && (
            <IconButton
              disabled={!isValid}
              onClick={handleClick}
              style={{
                backgroundColor: `${
                  isValid
                    ? theme.palette.primary.main
                    : theme.palette.action.disabledBackground
                }`,
              }}
              sx={{
                color: 'primary.contrastText',
                borderRadius: '0 4px 4px 0',
                overflow: 'hidden',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}>
              <MoreIcon />
            </IconButton>
          )}
        </ButtonGroup>
      </Box>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}>
        {listItems.map((item, index) => (
          <Box key={`${item.label}-${index}`}>
            <MenuItem
              onClick={() => {
                item.onClick();
                handleClose();
              }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>
                <Typography variant="body2">{item.label}</Typography>
              </ListItemText>
            </MenuItem>
            {item.showBorder && <Divider />}
          </Box>
        ))}
      </Menu>
    </Drawer>
  );
};
