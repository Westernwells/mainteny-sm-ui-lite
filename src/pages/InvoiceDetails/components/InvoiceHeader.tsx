import Box from '@mui/material/Box';
import {FormLabel} from 'components/form/FormLabel';

export const InvoiceHeader = () => (
  <Box
    px=".5em"
    sx={{
      display: 'grid',
      gridTemplateColumns: '3ch 2fr repeat(4, 10ch)',
      placeItems: 'center',
      gap: '.5em',
    }}>
    <FormLabel text="No" />
    <FormLabel text="Description" sx={{justifySelf: 'start'}} />
    <FormLabel text="Unit Price" />
    <FormLabel text="Quantity" />
    <FormLabel text="Unit" />
    <Box sx={{justifySelf: 'end'}}>
      <FormLabel text="Total Price" sx={{display: 'block'}} />
      <FormLabel text="(excl VAT)" />
    </Box>
  </Box>
);
