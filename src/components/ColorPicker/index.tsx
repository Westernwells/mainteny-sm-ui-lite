import {HexColorInput, HexColorPicker} from 'react-colorful';
import {Box} from '@mui/material';
import './ColorPointer.styles.css';
import {useRef} from 'react';

export type Props = {
  value: string;
  onChange: (value: string) => void;
};

const ColorPicker = ({value, onChange}: Props) => {
  const anchorEl = useRef<HTMLDivElement>(null);

  const focusInput = () => {
    const input = anchorEl.current?.querySelector('input');
    input?.focus();
  };

  return (
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
        <Box ref={anchorEl}>
          <HexColorInput
            className="color-hex-input-field"
            color={value}
            onChange={onChange}
            onClick={(e) => {
              e.stopPropagation();
              focusInput();
            }}
            onFocus={(e) => {
              e.stopPropagation();
              e.target.select();
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ColorPicker;
