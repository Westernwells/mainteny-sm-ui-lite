import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileDownloadOffOutlinedIcon from '@mui/icons-material/FileDownloadOffOutlined';
import SendIcon from '@mui/icons-material/Send';
import ReplayIcon from '@mui/icons-material/Replay';
import {usePublishQuotation} from 'hooks/reactQuery/useQuotation';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {QuotationStatus, QuotationView} from 'models/quotation';
import {PdfGenerationStatus} from 'models/misc';

interface Props {
  quotation: QuotationView;
}

export const Actions = ({quotation}: Props) => {
  const {data: downloadUrl} = useDownloadUrl(
    quotation ? [quotation!.additionalInfo.pdfPath] : [],
  );
  const {mutate: sendQuotation} = usePublishQuotation();

  return (
    <Box>
      {quotation!.additionalInfo.pdfGenerationStatus ===
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

      {quotation.status === QuotationStatus.DRAFT && (
        <IconButton
          onClick={() => {
            if (quotation.id) sendQuotation(quotation.id);
          }}>
          <SendIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      )}
      {quotation.status === QuotationStatus.SENT_TO_CLIENT && (
        <IconButton
          onClick={() => {
            if (quotation.id) sendQuotation(quotation.id);
          }}>
          <ReplayIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      )}
    </Box>
  );
};
