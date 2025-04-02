import {HexColorInput, HexColorPicker} from 'react-colorful';
import {Box} from '@mui/material';
import './ColorPointer.styles.css';

export type Props = {
  value: string;
  onChange: (value: string) => void;
};

const ColorPicker = ({value, onChange}: Props) => (
  <Box
    className="custom-styles"
    sx={{display: 'flex', flexDirection: 'column', gap: 1, width: '100%'}}>
    <HexColorPicker color={value} onChange={onChange} />

    <Box
      sx={{
        display: 'flex',
        padding: '0 12px',
        alignItems: 'center',
      }}>
      <HexColorInput
        className="color-hex-input-field"
        color={value}
        onChange={onChange}
      />
    </Box>
  </Box>
);

export default ColorPicker;
