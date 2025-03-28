import {IconButton} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

type Props = {
  isVisible: boolean;
};

const DragHandle = ({isVisible}: Props) => (
  <IconButton
    className="drag-handle"
    style={{
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.2s',
      padding: '8px',
      cursor: 'grab',
    }}>
    <DragIndicatorIcon sx={{color: '#828DA3'}} />
  </IconButton>
);

export default DragHandle;
