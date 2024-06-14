import {IconButton} from '@mui/material';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import {Editor} from '@tiptap/react';

interface Props {
  editor: Editor | null;
}
const FormatItalicButton = ({editor}: Props) => {
  const isActive = editor?.isActive('italic');

  return (
    <IconButton
      sx={{
        borderRadius: '4px',
        padding: '5px',
        background: isActive ? '#e2e6ea' : 'initial',
      }}
      onClick={() => editor?.chain().focus().toggleItalic().run()}>
      <FormatItalicIcon
        sx={{fontSize: '1.3rem', color: isActive ? 'primary.main' : 'inherit'}}
      />
    </IconButton>
  );
};
export default FormatItalicButton;
