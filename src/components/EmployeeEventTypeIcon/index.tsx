import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import DeviceThermostatOutlinedIcon from '@mui/icons-material/DeviceThermostatOutlined';
import {Box} from '@mui/system';
import {EmployeeEventType} from 'models/employee';

interface Props {
  type?: EmployeeEventType;
  color?: string;
  size?: number;
}

const DEFAULT_STYLE = {
  width: '60%',
  height: '60%',
};

export const EmployeeEventTypeIcon = ({
  type,
  size = 30,
  color = '#828DA3',
}: Props) => {
  const renderIcon = () => {
    switch (type) {
      case EmployeeEventType.OFFICE_HOURS:
        return <WorkOutlineOutlinedIcon sx={DEFAULT_STYLE} htmlColor={color} />;
      case EmployeeEventType.VACATION:
        return <BeachAccessOutlinedIcon sx={DEFAULT_STYLE} htmlColor={color} />;
      case EmployeeEventType.SICK_LEAVE:
        return (
          <DeviceThermostatOutlinedIcon sx={DEFAULT_STYLE} htmlColor={color} />
        );
      default:
        return <WorkOutlineOutlinedIcon sx={DEFAULT_STYLE} htmlColor={color} />;
    }
  };

  return (
    <Box
      sx={{
        background: '#0F4C6414',
        width: size,
        height: size,
        borderRadius: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {renderIcon()}
    </Box>
  );
};
