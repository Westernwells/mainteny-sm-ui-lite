import React, {Dispatch, FC, SetStateAction} from 'react';
import SwitchLeftOutlinedIcon from '@mui/icons-material/SwitchLeftOutlined';
import SwitchRightOutlinedIcon from '@mui/icons-material/SwitchRightOutlined';
import {IconButton} from '@mui/material';

interface Props {
  direction: 'asc' | 'desc';
  onSort: Dispatch<SetStateAction<'asc' | 'desc'>>;
  children?: React.ReactNode;
}

export const sortByName =
  (direction: 'asc' | 'desc') => (a: string, b: string) => {
    const nameA = a.toLowerCase();
    const nameB = b.toLowerCase();

    // Compare the names based on the direction
    if (direction === 'asc') {
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
    } else if (direction === 'desc') {
      if (nameA > nameB) {
        return -1;
      }
      if (nameA < nameB) {
        return 1;
      }
    }
    return 0;
  };

const CustomSortLabel: FC<Props> = ({direction = 'asc', onSort, children}) => (
  <>
    {children}
    <IconButton onClick={() => onSort(direction === 'asc' ? 'desc' : 'asc')}>
      {direction === 'asc' && (
        <SwitchLeftOutlinedIcon sx={{transform: 'rotate(-90deg)'}} />
      )}
      {direction === 'desc' && (
        <SwitchRightOutlinedIcon sx={{transform: 'rotate(-90deg)'}} />
      )}
    </IconButton>
  </>
);

export default CustomSortLabel;
