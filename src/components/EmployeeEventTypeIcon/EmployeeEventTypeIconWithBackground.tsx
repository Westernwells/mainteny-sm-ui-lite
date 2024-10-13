import {Box} from '@mui/system';
import {EmployeeEventType} from 'models/employee';
import {EmployeeEventTypeIcon} from '.';

interface Props {
  type?: EmployeeEventType;
  color?: string;
  size?: number;
}

const DEFAULT_STYLE = {
  width: '60%',
  height: '60%',
};

export const EmployeeEventTypeIconWithBackground = ({
  type,
  size = 30,
  color = '#828DA3',
}: Props) => (
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
    <EmployeeEventTypeIcon
      width={DEFAULT_STYLE.width}
      height={DEFAULT_STYLE.height}
      color={color}
      type={type}
    />
  </Box>
);
