import {Box} from '@mui/system';
import PredefinedColorButton, {
  SharedProps,
} from 'components/ColorPicker/PredefinedColorButton';
import {CUSTOM_COLORS} from 'models/pdfs';
import {convertRGBtoHex} from 'utils/color';
import {useMemo} from 'react';

type Props = {
  selectedColor: string;
  onClick: (value: string) => void;
} & SharedProps;

const ColorPickerPredefined = ({
  selectedColor,
  onClick,
  ...sharedProps
}: Props) => {
  const convertedColor = useMemo(
    () => convertRGBtoHex(selectedColor) ?? selectedColor,
    [selectedColor],
  );

  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
      {CUSTOM_COLORS.map((color) => (
        <PredefinedColorButton
          color={color}
          active={convertedColor === color}
          onClick={onClick}
          {...sharedProps}
        />
      ))}
    </Box>
  );
};

export default ColorPickerPredefined;
