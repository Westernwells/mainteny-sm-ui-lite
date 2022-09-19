import Box, {BoxProps} from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import IconButton from '@mui/material/IconButton';
import Edit from '@mui/icons-material/Edit';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import {format} from 'date-fns';
import {Comment} from 'models/quotation';

interface Props extends BoxProps {
  note: Comment;
  onDelete: () => void;
}

export const NoteCard = ({note, onDelete, ...rest}: Props) => {
  const theme = useTheme();

  return (
    <Box>
      <Box
        sx={{
          py: '1.5em',
          px: '1em',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        {...rest}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {`${note.meta.creator?.firstName} ${
              note.meta.creator?.lastName
            } - ${format(
              new Date(note.meta.createdAt),
              'dd.MM.yyyy, hh:mm a',
            )}`}
          </Typography>
          <Box display="flex" alignItems="center">
            <IconButton size="small">
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onDelete}>
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="h6" pt="1rem">
          {note.content}
        </Typography>
      </Box>
    </Box>
  );
};
