import Box, {BoxProps} from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import IconButton from '@mui/material/IconButton';
import Edit from '@mui/icons-material/Edit';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import {format} from 'date-fns';
import {Comment} from 'models/comment';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {SxProps} from '@mui/system/styleFunctionSx/styleFunctionSx';
import {Chip} from '@mui/material';

interface Props extends BoxProps {
  note: Comment;
  onDelete: () => void;
  onEdit: () => void;
  styles?: SxProps;
  isEditing?: boolean;
}

export const NoteCard = ({
  note,
  onDelete,
  onEdit,
  isEditing = false,
  styles,
  ...rest
}: Props) => {
  const theme = useTheme();
  const {user} = useUserSession();
  return (
    <Box>
      <Box
        sx={{
          py: '1.5em',
          px: '1em',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          ...styles,
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
            {`${note.meta.creator?.firstName} ${note.meta.creator?.lastName} - `}
            {isEditing ? (
              <span>
                <Chip label="Editing" size="small" variant="outlined" />
              </span>
            ) : (
              format(new Date(note.meta.createdAt), 'dd.MM.yyyy, HH:mm')
            )}
          </Typography>

          {note.meta.creator?.id === user?.userAccount.id && (
            <Box display="flex" alignItems="center">
              <IconButton size="small" onClick={onEdit}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={onDelete}>
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        <Typography variant="h6" pt="1rem" sx={{whiteSpace: 'pre-line'}}>
          {note.content}
        </Typography>
      </Box>
    </Box>
  );
};
