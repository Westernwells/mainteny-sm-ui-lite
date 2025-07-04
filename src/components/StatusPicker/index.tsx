import {Box, Menu, MenuItem, Typography} from '@mui/material';
import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {theme} from 'theme';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

export interface StatusPickerOption {
  label: string;
  value: string;
  backgroundColor?: string;
  textColor?: string;
  icon?: React.JSX.Element;
}

interface Props {
  options: StatusPickerOption[];
  value?: string;
  onChange: (newOption: StatusPickerOption) => void;
  testId?: string;
}

const StatusPicker = ({options, value, onChange, testId}: Props) => {
  const {t} = useTranslation();
  const [open, setOpen] = useState(false);
  const anchorEl = useRef<HTMLElement>(null);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const selectedValueIndex = options.findIndex((item) => item.value === value);
  const selectedOption = (
    selectedValueIndex !== -1 ? options[selectedValueIndex] : options[0]
  )!;
  const {backgroundColor: optBgColor, textColor: optTextColor} = selectedOption;
  const backgroundColor = optBgColor ?? theme.palette.primary.main;
  const textColor = optTextColor ?? 'white';

  const handleNext = () => {
    if (selectedValueIndex === options.length - 1) {
      onChange(options[0]);
      return;
    }

    onChange(options[selectedValueIndex + 1]);
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        ref={anchorEl}
        data-testid={testId}
        sx={{
          backgroundColor,
          borderRadius: 15,
          py: '3px',
          paddingLeft: '10px',
          paddingRight: '2px',
        }}>
        <button
          type="button"
          data-role="dropdown-button"
          style={{
            padding: 0,
            backgroundColor: 'transparent',
            outline: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={handleClick}>
          <Typography color={textColor} fontSize="1em">
            {t(selectedOption.label)}
          </Typography>
        </button>
        <Box
          sx={{
            height: '100%',
            width: '1px',
            backgroundColor: textColor,
            marginLeft: '7px',
            marginRight: '0px',
          }}
        />
        <button
          type="button"
          onClick={handleNext}
          data-role="next-arrow"
          style={{
            background: 'transparent',
            outline: 'none',
            border: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            cursor: 'pointer',
          }}>
          <ArrowRightIcon
            sx={{width: '20px', height: '20px'}}
            htmlColor={textColor}
          />
        </button>
      </Box>

      <Menu anchorEl={anchorEl.current} open={open} onClose={handleClose}>
        {options.map((option) => (
          <MenuItem
            onClick={() => {
              onChange(option);
              handleClose();
            }}>
            {option.icon}
            <Typography fontSize="15px" mt="3px" ml="7px">
              {t(option.label)}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default StatusPicker;
