import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  header: string;
  body: string[];
  onClose: () => void;
}

export const SelectCard = ({header, body, onClose}: Props) => (
  <Box
    display="flex"
    bgcolor="grey.200"
    minHeight="5em"
    alignItems="start"
    justifyContent="space-between"
    px="1em"
    py=".5em"
    border="1px solid"
    borderColor="inputBackground.main"
    borderRadius="4px">
    <Box>
      <Typography variant="body2">{header}</Typography>
      {body.map((content) => (
        <Typography
          key={content}
          variant="caption"
          color="textSecondary"
          display="block">
          {content}
        </Typography>
      ))}
    </Box>
    <IconButton onClick={onClose}>
      <CloseIcon />
    </IconButton>
  </Box>
);
