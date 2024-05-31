import {IconButton} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface Props {
  onClick?: () => void;
}
const AttachFileButton = ({onClick}: Props) => (
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
);
export default AttachFileButton;
