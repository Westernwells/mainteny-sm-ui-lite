import React, {useState} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Typography from '@mui/material/Typography';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {Box} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {Confirm} from 'components/Confirm';
import {useDeleteServiceCompanyContactPerson} from 'hooks/reactQuery/useContacts';
import TableActionButton from 'components/Table/TableActionButton';

export interface IActions {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onShowDetails: (id: string) => void;
  onSendEmail: (id: string) => void;
}

interface Props {
  contactId: string;
}

interface ActionButton {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
}

const Actions = ({
  contactId,
  onDelete,
  onEdit,
  onShowDetails,
  onSendEmail,
}: Props & IActions) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const open = Boolean(anchorEl);

  const {mutate: deleteContact, isLoading: isDeleting} =
    useDeleteServiceCompanyContactPerson('Contact person deleted successfully');

  const handleDeleteConfirm = async (id: string) => {
    await deleteContact(id);
    setOpenDeleteConfirm(false);
    onDelete(id);
  };

  const handleDelete = () => {
    setOpenDeleteConfirm(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const actionButtons: ActionButton[] = [
    {
      icon: <SendOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: 'Send email',
      onClick: () => onSendEmail(contactId),
    },
    {
      icon: <InfoOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: 'Show details',
      onClick: () => onShowDetails(contactId),
    },
    {
      icon: <EditOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: 'Edit',
      onClick: () => onEdit(contactId),
    },
    {
      icon: <DeleteOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: 'Delete',
      onClick: () => handleDelete(),
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '40px',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <TableActionButton
        testId="contact-action-menu-button"
        removePadding
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
      />
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

      <Confirm
        maxWidth={400}
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          await handleDeleteConfirm(contactId || '');
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Delete contact person"
        content="You are about to delete this contact person. Are you sure about it?"
      />
    </Box>
  );
};

export default React.memo(Actions);
