import {Box} from '@mui/system';
import PredefinedColorButton from 'components/ColorPicker/PredefinedColorButton';
import {CUSTOM_COLORS} from 'models/pdfs';

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
