import {Box, Tooltip} from '@mui/material';
import {TagRecord} from 'models/tag';
import useTheme from '@mui/material/styles/useTheme';
import Tag from '.';

type Props = {
  tags: TagRecord[];
  showGroupTagsPopover?: boolean;
};

const TagGroup = ({tags, showGroupTagsPopover}: Props) => {
  const theme = useTheme();

  return (
    <Tooltip
      disableHoverListener={!showGroupTagsPopover}
      title={
        <Box
          sx={{
            width: '132px',
            padding: theme.spacing(1),
            backgroundColor: '#616161E5',
            display: 'flex',
            flexWrap: 'wrap',
            gap: theme.spacing(0.5),
          }}>
          {tags.map((tag) => (
            <Tag key={`group-tag-${tag.id}`} {...tag} maxWidth="120px" />
          ))}
        </Box>
      }
      placement="right"
      arrow>
      <Box
        sx={{
          display: 'flex',
          color: theme.palette.primary.main,
          backgroundColor: '#8F9BB326',
          borderRadius: '16px',
          padding: '4px 6px',
          height: '24px',
          alignItems: 'center',
          cursor: 'pointer',
        }}>
        {`+${tags.length}`}
      </Box>
    </Tooltip>
  );
};

export default TagGroup;
