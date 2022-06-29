import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileDownloadOffOutlinedIcon from '@mui/icons-material/FileDownloadOffOutlined';
import SendIcon from '@mui/icons-material/Send';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import {Confirm} from 'components/Confirm';
import {
  useDeleteQuotation,
  usePublishQuotation,
} from 'hooks/reactQuery/useQuotation';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {QuotationStatus, QuotationView} from 'models/quotation';
import {PdfGenerationStatus} from 'models/misc';
import {useState} from 'react';

interface Props {
  quotation: QuotationView;
}

export const Actions = ({quotation}: Props) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {data: downloadUrl} = useDownloadUrl(
    quotation ? [quotation!.additionalInfo.pdfPath] : [],
  );
  const {mutate: sendQuotation} = usePublishQuotation();
  const {mutate: deleteQuotation} = useDeleteQuotation();

  return (
    <Box>
      {quotation.status !== QuotationStatus.DRAFT &&
        (quotation!.additionalInfo.pdfGenerationStatus ===
          PdfGenerationStatus.DONE && downloadUrl ? (
          <IconButton
            onClick={() =>
              window.open(`${Object.values(downloadUrl)[0]}`, '_blank')
            }>
            <FileDownloadOutlinedIcon
              fontSize="small"
              sx={{color: 'action.active'}}
            />
          </IconButton>
        ) : (
          <IconButton disabled>
            <FileDownloadOffOutlinedIcon
              fontSize="small"
              sx={{color: 'action.active', cursor: 'not-allowed'}}
            />
          </IconButton>
        ))}

      {quotation.status === QuotationStatus.DRAFT && (
        <>
          <IconButton
            onClick={() => {
              setIsDeleteDialogOpen(true);
            }}>
            <DeleteIcon fontSize="small" sx={{color: 'action.active'}} />
          </IconButton>
          <IconButton
            onClick={() => {
              if (quotation.id) sendQuotation(quotation.id);
            }}>
            <SendIcon fontSize="small" sx={{color: 'action.active'}} />
          </IconButton>
        </>
      )}
      {quotation.status === QuotationStatus.SENT_TO_CLIENT && (
        <IconButton
          onClick={() => {
            if (quotation.id) sendQuotation(quotation.id);
          }}>
          <ReplayIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      )}
      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (quotation.id)
            deleteQuotation({
              quotationId: quotation.id,
              shouldNavigate: false,
            });
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Quotation"
        content="Do you want to delete this Quotation?"
        helperText="This action is irreversible."
      />
    </Box>
  );
};
