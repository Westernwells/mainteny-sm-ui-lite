import {IconButton} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import {Editor} from '@tiptap/react';

interface Props {
  editor: Editor | null;
}
const FormatBoldButton = ({editor}: Props) => {
  const isActive = editor?.isActive('bold');

  return (
    <IconButton
      sx={{
        borderRadius: '4px',
        padding: '5px',
        background: isActive ? '#e2e6ea' : 'initial',
      }}
      onClick={() => editor?.chain().focus().toggleBold().run()}>
      <FormatBoldIcon
        sx={{fontSize: '1.3rem', color: isActive ? 'primary.main' : 'inherit'}}
      />
    </IconButton>
  );
};
export default FormatBoldButton;
