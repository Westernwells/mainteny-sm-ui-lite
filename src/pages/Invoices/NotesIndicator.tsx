import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {InvoiceView} from 'models/invoice';

interface Props {
  invoice: InvoiceView;
}

export const NotesIndicator = ({invoice}: Props) => (
  <Box>
    <IconButton>
      <NoteAlt
        fontSize="small"
        sx={{
          color: invoice.commentCount ? 'primary.main' : 'text.disabled',
        }}
      />
    </IconButton>
  </Box>
);
