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
import {getUserFullName} from 'utils/utils';
import DOMPurify from 'dompurify';
import {Avatar} from './Avatar';

interface Props extends BoxProps {
  note: Comment;
  onDelete: () => void;
  onEdit: () => void;
  styles?: SxProps;
}

export const NoteCard = ({note, onDelete, onEdit, styles}: Props) => {
  const theme = useTheme();
  const {user} = useUserSession();

  return (
    <Box
      sx={{
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        ...styles,
      }}
      py={2}
      px="1.5rem">
      <Box flexDirection="row" display="flex" justifyContent="space-between">
        <Box alignItems="center" flexDirection="row" display="flex">
          <Box>
            <Avatar removeNameText userAccount={note.meta.creator!} />
          </Box>
          <Typography fontWeight="bold" variant="body2" ml={1}>
            {getUserFullName(note.meta.creator!)}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="row" alignItems="center">
          <Typography color={theme.palette.text.secondary} variant="body2">
            {format(new Date(note.meta.createdAt), 'dd.MM.yyyy, HH:mm')}
          </Typography>
          {note.meta.creator?.id === user?.userAccount.id && (
            <Box ml={2} display="flex" alignItems="center">
              <IconButton size="small" onClick={onEdit}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={onDelete}>
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
      <Box mt={2}>
        <Typography
          variant="body2"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(note.content),
          }}
        />
      </Box>
    </Box>
  );
};
