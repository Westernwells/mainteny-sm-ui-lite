import {IconButton} from '@mui/material';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import {Editor} from '@tiptap/react';

interface Props {
  editor: Editor | null;
}
const FormatUnderlineButton = ({editor}: Props) => {
  const isActive = editor?.isActive('underline');

  return (
    <IconButton
      sx={{
        borderRadius: '4px',
        padding: '5px',
        background: isActive ? '#e2e6ea' : 'initial',
      }}
      onClick={() => editor?.chain().focus().toggleUnderline().run()}>
      <FormatUnderlinedIcon
        sx={{fontSize: '1.3rem', color: isActive ? 'primary.main' : 'inherit'}}
      />
    </IconButton>
  );
};
export default FormatUnderlineButton;
