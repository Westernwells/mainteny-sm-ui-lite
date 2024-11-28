import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import {useNavigate} from 'react-router-dom';

interface Props {
  label: string;
  containerStyle?: {[key: string]: string | number};
  path?: string;
  onBackAction?: () => void;
}

export const BackAction = ({
  label,
  containerStyle,
  path,
  onBackAction,
}: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Box
      display="flex"
      sx={{cursor: 'pointer', ...containerStyle}}
      onClick={() => {
        if (onBackAction) {
          onBackAction();
        } else if (path) {
          navigate(path);
        } else {
          navigate(-1);
        }
      }}>
      <Box mr={2} sx={{mt: '0.3em'}}>
        <ArrowBackIosNewIcon sx={{color: theme.palette.action.active}} />
      </Box>
      {label ? (
        <Typography variant="h4" component="div">
          {label}
        </Typography>
      ) : null}
    </Box>
  );
};
