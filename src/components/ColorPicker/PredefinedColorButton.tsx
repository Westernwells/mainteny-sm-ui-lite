import {Box} from '@mui/system';

const SIZE_TO_PX = {
  small: 24,
  medium: 32,
};

export type SharedProps = {
  size?: 'small' | 'medium';
};

type Props = SharedProps & {
  color: string;
  active: boolean;
  size?: 'small' | 'medium';
  onClick: (color: string) => void;
};

const PredefinedColorButton = ({
  color,
  active,
  size = 'medium',
  onClick,
}: Props) => (
  <Box
    onClick={() => onClick(color)}
    sx={{
      display: 'flex',
      width: `${SIZE_TO_PX[size]}px`,
      height: `${SIZE_TO_PX[size]}px`,
      color,
      cursor: 'pointer',
      borderRadius: '4px',
      border: '1px solid rgba(34, 43, 69, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF',

      ...(active && {border: `2px solid ${color}`}),
    }}>
    A
  </Box>
);

export default PredefinedColorButton;
