import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import DeviceThermostatOutlinedIcon from '@mui/icons-material/DeviceThermostatOutlined';
import {EmployeeEventType} from 'models/employee';

interface Props {
  type?: EmployeeEventType;
  color?: string;
  width?: number | string;
  height?: number | string;
}

const DEFAULT_STYLE = {
  width: 20,
  height: 20,
};

export const EmployeeEventTypeIcon = ({
  type,
  width = DEFAULT_STYLE.width,
  height = DEFAULT_STYLE.height,
  color = '#828DA3',
}: Props) => {
  const style = {width, height};

  const renderIcon = () => {
    switch (type) {
      case EmployeeEventType.OFFICE_HOURS:
        return <WorkOutlineOutlinedIcon sx={style} htmlColor={color} />;
      case EmployeeEventType.VACATION:
        return <BeachAccessOutlinedIcon sx={style} htmlColor={color} />;
      case EmployeeEventType.SICK_LEAVE:
        return <DeviceThermostatOutlinedIcon sx={style} htmlColor={color} />;
      default:
        return <WorkOutlineOutlinedIcon sx={style} htmlColor={color} />;
    }
  };

  return renderIcon();
};
