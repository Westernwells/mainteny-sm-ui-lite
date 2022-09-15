import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {QuotationView} from 'models/quotation';
import {useQuotationComments} from 'hooks/reactQuery/useQuotation';

interface Props {
  quotation: QuotationView;
}

export const NotesIndicator = ({quotation}: Props) => {
  const {data, isLoading} = useQuotationComments(quotation.id, {
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
