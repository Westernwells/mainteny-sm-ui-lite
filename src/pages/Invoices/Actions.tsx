import {useState} from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileDownloadOffOutlinedIcon from '@mui/icons-material/FileDownloadOffOutlined';
import CheckIcon from '@mui/icons-material/Check';
import SendIcon from '@mui/icons-material/Send';
import ReplayIcon from '@mui/icons-material/Replay';
import {Confirm} from 'components/Confirm';
import {
  useInvoicePaymentStatus,
  usePublishInvoice,
} from 'hooks/reactQuery/useInvoice';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {InvoiceStatus, InvoiceView} from 'models/invoice';
import {PdfGenerationStatus} from 'models/misc';

interface Props {
  invoice: InvoiceView;
}

export const Actions = ({invoice}: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {data: downloadUrl} = useDownloadUrl(
    invoice ? [invoice!.additionalInfo.pdfPath] : [],
  );
  const {mutate: markAsPaid} = useInvoicePaymentStatus();
  const {mutate: sendInvoice} = usePublishInvoice();

  return (
    <Box>
      {invoice!.additionalInfo.pdfGenerationStatus ===
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
      )}
      {invoice.status === InvoiceStatus.NOT_PAID && (
        <IconButton onClick={() => setIsDialogOpen(true)}>
          <CheckIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      )}
      {invoice.status === InvoiceStatus.DRAFT && (
        <IconButton
          onClick={() => {
            if (invoice.id) sendInvoice(invoice.id);
          }}>
          <SendIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      )}
      {invoice.status === InvoiceStatus.EXPIRED && (
        <IconButton
          onClick={() => {
            if (invoice.id) sendInvoice(invoice.id);
          }}>
          <ReplayIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      )}
      <Confirm
        open={isDialogOpen}
        onConfirm={() => {
          if (invoice.id) markAsPaid(invoice.id);
          setIsDialogOpen(false);
        }}
        onClose={() => setIsDialogOpen(false)}
        title="Mark as paid"
        content="Do you want to mark this invoice as paid?"
        helperText="This action is irreversible."
      />
    </Box>
  );
};
