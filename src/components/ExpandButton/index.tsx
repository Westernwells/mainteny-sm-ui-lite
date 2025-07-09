import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {IconButton} from '@mui/material';
import React, {SyntheticEvent} from 'react';
import {SxProps} from '@mui/system';

type Props = {
  expanded: boolean;
  sx?: SxProps;
  onClick: (e: SyntheticEvent) => void;
};

const ExpandButton = ({expanded, sx, onClick}: Props) => (
  <IconButton
    sx={{
      padding: '6px',
      cursor: 'pointer',
      borderRadius: '4px',
      width: '24px',
      height: '24px',
      ...sx,
    }}
    onClick={onClick}>
    {!expanded ? (
      <ArrowRightIcon sx={{color: '#000034'}} />
    ) : (
      <ArrowDropDownIcon sx={{color: '#000034'}} />
    )}
  </IconButton>
);

export default ExpandButton;
