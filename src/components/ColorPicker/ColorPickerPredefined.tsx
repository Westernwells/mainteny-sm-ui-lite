import {Box} from '@mui/system';
import PredefinedColorButton from 'components/ColorPicker/PredefinedColorButton';

const CUSTOM_COLORS = [
  '#000034',
  '#828DA3',
  '#0092B2',
  '#0B79D0',
  '#4CAF50',
  '#FFB547',
  '#ED6C02',
  '#FF605A',
];

type Props = {
  selectedColor: string;
  onClick: (value: string) => void;
};

const ColorPickerPredefined = ({selectedColor, onClick}: Props) => (
  <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
    {CUSTOM_COLORS.map((color) => (
      <PredefinedColorButton
        color={color}
        active={selectedColor === color}
        onClick={onClick}
      />
    ))}
  </Box>
);

export default ColorPickerPredefined;
