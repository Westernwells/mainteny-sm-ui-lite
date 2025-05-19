import {TagRecord} from 'models/tag';
import IconButton from '@mui/material/IconButton';
import MoreIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Edit from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {Trans, useTranslation} from 'react-i18next';
import {MouseEventHandler, useRef, useState} from 'react';
import {useDeleteTag} from 'hooks/reactQuery/useTag';
import {Confirm} from 'components/Confirm';

type Props = Pick<TagRecord, 'id' | 'name'> & {
  iconPadding?: string;
  onRename: () => void;
};

const TagActions = ({id, name, iconPadding, onRename}: Props) => {
  const {t} = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const anchorEl = useRef<HTMLButtonElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {mutateAsync: handleDelete} = useDeleteTag();

  const handleClickDelete: MouseEventHandler<HTMLLIElement> = (e) => {
    // stop table cell event trigger
    e.stopPropagation();
    setIsOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    handleDelete({tagId: id});
    setIsDeleteDialogOpen(false);
  };

  const handleRenameClick: MouseEventHandler<HTMLLIElement> = (e) => {
    // stop table cell event trigger
    e.stopPropagation();
    setIsOpen(false);
    onRename();
  };

  return (
    <Box>
      <IconButton
        data-testid={`tag-action-menu-button-${id}`}
        key={`tag-action-menu-button-${id}`}
        ref={anchorEl}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          ...(iconPadding && {
            padding: iconPadding,
          }),
        }}
        disableRipple
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}>
        <MoreIcon
          fontSize="small"
          sx={{
            color: 'action.active',
          }}
        />
      </IconButton>
      <Menu
        id={`tag-action-menu-${id}`}
        key={`tag-action-menu-${id}`}
        data-testid={`tag-action-menu-${id}`}
        anchorEl={anchorEl.current}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
          sx: {width: '210px'},
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}>
        <Box key="tag-option-rename">
          <MenuItem
            data-testid="tag-option-rename-menu-item"
            onClick={handleRenameClick}
            sx={{py: '0.7rem'}}>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">{t('Rename')}</Typography>
            </ListItemText>
          </MenuItem>
        </Box>
        <Divider />
        <Box key="tag-option-delete">
          <MenuItem
            data-testid="tag-option-delete-menu-item"
            onClick={handleClickDelete}
            sx={{py: '0.7rem'}}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">{t('Delete')}</Typography>
            </ListItemText>
          </MenuItem>
        </Box>
      </Menu>

      {isDeleteDialogOpen && (
        <Confirm
          open={isDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          onClose={() => setIsDeleteDialogOpen(false)}
          title="Remove Tag"
          content={
            <Trans
              defaults="You are about to remove <bold>{{tagName}}</bold> tag."
              values={{tagName: name}}
              components={{bold: <strong />}}
            />
          }
          helperText="Are you sure about it?"
        />
      )}
    </Box>
  );
};

export default TagActions;
