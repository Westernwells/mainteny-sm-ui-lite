import {useCurrentEditor} from '@tiptap/react';
import {Box, Divider} from '@mui/material';
import FormatHeadingButton from './buttons/FormatHeadingButton';
import FormatTextAlignButton from './buttons/FormatTextAlignButton';
import FormatListButtons from './buttons/FormatListButtons';
import AttachFileButton from './buttons/AttachFileButton';
import FormatBoldButton from './buttons/FormatBoldButton';
import FormatItalicButton from './buttons/FormatItalicButton';
import FormatUnderlineButton from './buttons/FormatUnderlineButton';

interface Props {
  onOpenFileUpload?: () => void;
  hasAttachFileButton?: boolean;
}
const EditorMenuControls = ({
  onOpenFileUpload,
  hasAttachFileButton = true,
}: Props) => {
  const {editor} = useCurrentEditor();
  return (
    <Box display="flex" flexDirection="column">
      <Divider sx={{borderColor: '#E4E9F2'}} />
      <Box display="flex" alignItems="center" marginTop="8px" gap="0.5rem">
        <FormatHeadingButton editor={editor} />

        <FormatBoldButton editor={editor} />

        <FormatItalicButton editor={editor} />

        <FormatUnderlineButton editor={editor} />

        <Divider
          flexItem
          orientation="vertical"
          sx={{mx: 0.5, my: 1, border: '0.5px solid #8F9BB380'}}
        />

        <FormatTextAlignButton editor={editor} />

        <Divider
          flexItem
          orientation="vertical"
          sx={{mx: 0.5, my: 1, border: '0.5px solid #8F9BB380'}}
        />

        <FormatListButtons editor={editor} />

        {hasAttachFileButton && (
          <Divider
            flexItem
            orientation="vertical"
            sx={{mx: 0.5, my: 1, border: '0.5px solid #8F9BB380'}}
          />
        )}

        {hasAttachFileButton && <AttachFileButton onClick={onOpenFileUpload} />}
      </Box>
    </Box>
  );
};
export default EditorMenuControls;
