import {Box, Typography} from '@mui/material';
import {Avatar} from 'components/Avatar';
import useTheme from '@mui/material/styles/useTheme';
import {Comment} from 'models/comment';
import {getUserFullName} from 'utils/utils';
import {formatDate} from 'utils/datetime';
import DOMPurify from 'dompurify';

type Props = {
  data: Comment;
};

export const Note = ({data}: Props) => {
  const theme = useTheme();

  return (
    <Box
      flexDirection="row"
      display="flex"
      sx={{
        backgroundColor: theme.palette.inputBackground.main,
        p: 1.5,
        borderRadius: 2,
      }}>
      <Box>
        <Avatar
          userAccount={data.meta.creator!}
          initialsTextStyles={{fontSize: 14}}
          sx={{mr: 1, width: 40, height: 40}}
          removeNameText
        />
      </Box>
      <Box ml={1} mt={0.5} flex={1}>
        <Box flexDirection="row" justifyContent="space-between" display="flex">
          <Typography variant="body2" fontWeight="bold">
            {getUserFullName(data.meta.creator!)}
          </Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {formatDate(data.meta.createdAt)}
          </Typography>
        </Box>
        <Typography
          mt={0.5}
          variant="body2"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(data.content),
          }}
        />
      </Box>
    </Box>
  );
};
