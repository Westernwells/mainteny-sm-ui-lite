import Box from '@mui/material/Box';

interface Props {
  children: JSX.Element;
  containerStyles?: {[key: string]: string | number};
}

export const HistoryBasicDetails = ({children, containerStyles}: Props) => (
  <Box sx={{...containerStyles}}>{children}</Box>
);
