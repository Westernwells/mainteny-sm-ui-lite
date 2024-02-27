import React from 'react';
import {useNavigate} from 'react-router';
import Typography from '@mui/material/Typography';
import {InvoiceView} from 'models/invoice';

interface Props {
  invoice: InvoiceView;
}

export const NavigateToInvoice = ({invoice}: Props) => {
  const navigate = useNavigate();
  return invoice.externalId ? (
    <Typography
      variant="subtitle1"
      onClick={() => navigate(`/invoices/details/${invoice.id}`)}
      sx={{
        color: 'primary.light',
        cursor: 'pointer',
      }}>
      {invoice.externalId !== '' ? invoice.externalId : 'Unassigned'}
    </Typography>
  ) : (
    <Typography variant="subtitle1">
      {invoice.externalId !== '' ? invoice.externalId : 'Unassigned'}
    </Typography>
  );
};
