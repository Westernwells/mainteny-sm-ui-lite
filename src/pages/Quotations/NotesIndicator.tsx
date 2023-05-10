import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {QuotationView} from 'models/quotation';

interface Props {
  quotation: QuotationView;
}

export const NotesIndicator = ({quotation}: Props) => (
  <Box>
    <IconButton>
      <NoteAlt
        fontSize="small"
        sx={{
          color: quotation.commentCount ? 'primary.main' : 'text.disabled',
        }}
      />
    </IconButton>
  </Box>
);
