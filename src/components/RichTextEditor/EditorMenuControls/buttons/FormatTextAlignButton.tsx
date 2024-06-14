import {Box, IconButton} from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import {Editor} from '@tiptap/react';

interface Props {
  editor: Editor | null;
}
type TextAlign = 'left' | 'center' | 'right';

const FormatTextAlignButton = ({editor}: Props) => {
  const isCenter = editor?.isActive({textAlign: 'center'});
  const isLeft = editor?.isActive({textAlign: 'left'});
  const isRight = editor?.isActive({textAlign: 'right'});

  const setTextAlign = (align: TextAlign) => {
    editor?.chain().focus().setTextAlign(align).run();
  };

  return (
    <Box display="flex" alignItems="center">
      <IconButton
        sx={{
          borderRadius: '4px',
          padding: '5px',
          background: isLeft ? '#e2e6ea' : 'initial',
        }}
        onClick={() => setTextAlign('left')}>
        <FormatAlignLeftIcon
          sx={{fontSize: '1.3rem', color: isLeft ? 'primary.main' : 'inherit'}}
        />
      </IconButton>
      <IconButton
        sx={{
          borderRadius: '4px',
          padding: '5px',
          background: isCenter ? '#e2e6ea' : 'initial',
        }}
        onClick={() => setTextAlign('center')}>
        <FormatAlignCenterIcon
          sx={{
            fontSize: '1.3rem',
            color: isCenter ? 'primary.main' : 'inherit',
          }}
        />
      </IconButton>
      <IconButton
        sx={{
          borderRadius: '4px',
          padding: '5px',
          background: isRight ? '#e2e6ea' : 'initial',
        }}
        onClick={() => setTextAlign('right')}>
        <FormatAlignRightIcon
          sx={{fontSize: '1.3rem', color: isRight ? 'primary.main' : 'inherit'}}
        />
      </IconButton>
    </Box>
  );
};

export default FormatTextAlignButton;
