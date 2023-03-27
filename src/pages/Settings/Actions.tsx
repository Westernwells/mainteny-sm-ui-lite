import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MoreIcon from '@mui/icons-material/MoreVert';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import Edit from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {Confirm} from 'components/Confirm';
import {useDeleteChecklist} from 'hooks/reactQuery/useChecklists';
import {CheckList} from 'models/checklist';

interface Props {
  checklist: CheckList;
}

export const Actions = ({checklist}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const {mutate: deleteChecklist} = useDeleteChecklist(
    'Checklist template removed successfully!',
  );

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const actions = useMemo(() => {
    const items = [
      {
        label: t('Preview'),
        icon: <RemoveRedEye />,
        onClick: () => {
          navigate(`/settings/checklists/${checklist.id}`);
        },
      },
      {
        label: t('Edit'),
        icon: <Edit />,
        onClick: () => {
          navigate(`/settings/checklists/${checklist.id}?edit=1`);
        },
      },
      {
        label: t('Delete'),
        icon: <DeleteIcon />,
        onClick: () => setIsDeleteDialogOpen(true),
      },
    ];

    return items;
  }, []);

  return (
    <Box>
      <IconButton onClick={handleClick}>
        <MoreIcon fontSize="small" sx={{color: 'action.active'}} />
      </IconButton>
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
        {actions.map((item, index) => (
          <Box key={`${item.label}-${index}`}>
            <MenuItem
              onClick={() => {
                item.onClick();
                handleClose();
              }}
              sx={{py: '0.5rem'}}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>
                <Typography variant="body2">{item.label}</Typography>
              </ListItemText>
            </MenuItem>
            {index === actions.length - 2 && <Divider />}
          </Box>
        ))}
      </Menu>

      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          deleteChecklist(
            {id: checklist.id},
            {onSuccess: () => setIsDeleteDialogOpen(false)},
          );
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Remove checklist template"
        content="Do you want to delete this checklist template?"
      />
    </Box>
  );
};
