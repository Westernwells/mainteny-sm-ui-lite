import {Box} from '@mui/system';

type Props = {
  color: string;
  active: boolean;
  onClick: (color: string) => void;
};

const PredefinedColorButton = ({color, active, onClick}: Props) => (
  <Box
    onClick={() => onClick(color)}
    sx={{
      display: 'flex',
      width: '32px',
      height: '32px',
      color,
      cursor: 'pointer',
      borderRadius: '4px',
      border: '1px solid rgba(34, 43, 69, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',

      ...(active && {border: '2px solid #000034'}),
    }}>
    A
  </Box>
);

export default PredefinedColorButton;
