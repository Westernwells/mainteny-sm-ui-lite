import {IconButton, Tooltip} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {t} from 'i18next';

interface Props {
  onClick?: () => void;
}
const AttachFileButton = ({onClick}: Props) => (
  <Tooltip title={t('Attachment')} arrow placement="top">
    <IconButton
      onClick={onClick}
      sx={{
        borderRadius: '4px',
        padding: '5px',
      }}>
      <AttachFileIcon
        sx={{
          fontSize: '1.3rem',
        }}
      />
    </IconButton>
  </Tooltip>
);
export default AttachFileButton;
