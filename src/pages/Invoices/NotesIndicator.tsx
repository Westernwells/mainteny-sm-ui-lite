import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {InvoiceView} from 'models/invoice';
import {useInvoiceComments} from 'hooks/reactQuery/useInvoice';

interface Props {
  invoice: InvoiceView;
}

export const NotesIndicator = ({invoice}: Props) => {
  const {data, isLoading} = useInvoiceComments(invoice.id, {
    pageIndex: 0,
    pageSize: 1,
  });

  return (
    <Box>
      <IconButton>
        <NoteAlt
          fontSize="small"
          sx={{
            color:
              !isLoading && !!data?.total ? 'primary.main' : 'text.disabled',
          }}
        />
      </IconButton>
    </Box>
  );
};
