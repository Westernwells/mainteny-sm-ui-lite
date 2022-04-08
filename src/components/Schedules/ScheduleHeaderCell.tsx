import Box from '@mui/material/Box';

interface Props {
  label: string;
}

export const ScheduleHeaderCell = ({label, ...rest}: Props) => (
  <Box
    component="th"
    sx={{
      outline: '1px solid #dddddd',
      textAlign: 'left',
      height: '70px',
      paddingBlock: '8px',
      paddingInline: 0,
      maxWidth: '120px',
      minWidth: '120px',
    }}
    {...rest}>
    {label}
  </Box>
);
