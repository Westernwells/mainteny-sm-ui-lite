import React, {useState} from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import {useDeleteCustomer} from 'hooks/reactQuery/useCustomers';
import {Confirm} from 'components/Confirm';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';

interface Props {
  propertyOwnerId: string;
  toEmail: string;
}

export const Actions = ({propertyOwnerId, toEmail}: Props) => {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const {mutateAsync: deleteCustomer, isLoading: isDeleting} =
    useDeleteCustomer('Customer deleted successfully');

  return (
    <Box>
      <IconButton
        component="a"
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.stopPropagation();
          window.open(`mailto:${toEmail}`, '_blank');
        }}>
        <SendIcon sx={{color: 'action.active'}} fontSize="small" />
      </IconButton>

      <IconButton
        onClick={() => {
          Mixpanel.identifyAndTrack(mixpanelEvents.CUSTOMERS_DELETE_CLICKED, {
            pageName: 'Customers',
            source: 'Customer List View',
          });
          setOpenDeleteConfirm(true);
        }}>
        <Delete sx={{color: 'action.active'}} fontSize="small" />
      </IconButton>

      <Confirm
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          await deleteCustomer(propertyOwnerId!);
          setOpenDeleteConfirm(false);
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Confirm"
        content="Do you want to delete this customer?"
      />
    </Box>
  );
};
