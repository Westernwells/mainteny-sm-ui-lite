import {Box, IconButton} from '@mui/material';
import {Editor} from '@tiptap/react';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

interface Props {
  editor: Editor | null;
}
const FormatListButtons = ({editor}: Props) => {
  const isBulletList = editor?.isActive('bulletList');
  const isOrderedList = editor?.isActive('orderedList');

  return (
    <Box display="flex" alignItems="center">
      <IconButton
        sx={{
          borderRadius: '4px',
          padding: '5px',
          background: isBulletList ? '#e2e6ea' : 'initial',
        }}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}>
        <FormatListBulletedIcon
          sx={{
            fontSize: '1.3rem',
            color: isBulletList ? 'primary.main' : 'inherit',
          }}
        />
      </IconButton>
      <IconButton
        sx={{
          borderRadius: '4px',
          padding: '5px',
          background: isOrderedList ? '#e2e6ea' : 'initial',
        }}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
        <FormatListNumberedIcon
          sx={{
            fontSize: '1.3rem',
            color: isOrderedList ? 'primary.main' : 'inherit',
          }}
        />
      </IconButton>
    </Box>
  );
};
export default FormatListButtons;
