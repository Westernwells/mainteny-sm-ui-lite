import {Switch as MuiSwitch} from '@mui/material';
import styled from '@mui/system/styled';

type Props = {
  value: boolean;
  onChange: () => void;
};

const Switch = ({value, onChange}: Props) => {
  const AntSwitch = styled(MuiSwitch)(({theme}) => ({
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
    '& .MuiSwitch-switchBase': {
      padding: 3,
      '&.Mui-checked': {
        transform: 'translateX(12px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: theme.palette.primary.dark,
        },
      },
    },
    '& .MuiSwitch-thumb': {
      width: 10,
      height: 10,
      borderRadius: 6,
    },
    '& .MuiSwitch-track': {
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor: 'rgba(0,0,0,.25)',
      boxSizing: 'border-box',
    },
  }));

  return <AntSwitch checked={value} onChange={onChange} />;
};

export default Switch;
