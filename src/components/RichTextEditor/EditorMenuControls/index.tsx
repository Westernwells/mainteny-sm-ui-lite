import {useCurrentEditor} from '@tiptap/react';
import {Box, Divider, Popover, Typography} from '@mui/material';
import React, {useState} from 'react';
import TextBlockSelect from 'components/text-blocks/TextBlockSelect';
import {TextBlockCategory, TextBlockView} from 'models/text-block';
import {useTranslation} from 'react-i18next';
import TextBlockActions from 'components/text-blocks/TextBlockActions';
import {cleanHtmlContent} from 'utils/text-block';
import {useQueryEmployeeSignature} from 'hooks/reactQuery/useEmployee';
import {EmailSignature} from 'models/employee';
import FormatHeadingButton from './buttons/FormatHeadingButton';
import FormatTextAlignButton from './buttons/FormatTextAlignButton';
import FormatListButtons from './buttons/FormatListButtons';
import AttachFileButton from './buttons/AttachFileButton';
import FormatBoldButton from './buttons/FormatBoldButton';
import FormatItalicButton from './buttons/FormatItalicButton';
import FormatUnderlineButton from './buttons/FormatUnderlineButton';
import TextBlockButton from './buttons/TextBlockButton';
import LinkButton from './buttons/LinkButton';
import SignatureButton from './buttons/SignatureButton';

interface Props {
  onOpenFileUpload?: () => void;
  hasAttachFileButton?: boolean;
  hasSignatureButton?: boolean;
  showTextBlock?: boolean;
  onSignatureSelect?: (signature?: EmailSignature) => void;
  updateHtml?: (value: string) => void;
  onChange: (value: string) => void;
}

const EditorMenuControls = ({
  onOpenFileUpload,
  hasAttachFileButton = true,
  hasSignatureButton = false,
  showTextBlock = true,
  onSignatureSelect,
  updateHtml,
  onChange,
}: Props) => {
  const {t} = useTranslation();
  const {editor} = useCurrentEditor();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const {data: signatures} = useQueryEmployeeSignature();

  const [activeSubDialog, setActiveSubDialog] = useState<
    'edit' | 'preview' | 'delete' | 'create' | undefined
  >(undefined);

  const [activeTextBlock, setActiveTextBlock] = useState<
    TextBlockView | undefined
  >(undefined);

  const onCloseSubDialogs = () => {
    setActiveSubDialog(undefined);
  };

  const handleTextBlockClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleCellClick = (text: string) => {
    if (editor) {
      editor.chain().focus().insertContent(text).run();
    }
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'text-block-popover' : undefined;
  return (
    <Box display="flex" flexDirection="column">
      <Divider sx={{borderColor: '#E4E9F2'}} />
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
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

          {hasAttachFileButton && (
            <AttachFileButton onClick={onOpenFileUpload} />
          )}

          <Divider
            flexItem
            orientation="vertical"
            sx={{mx: 0.5, my: 1, border: '0.5px solid #8F9BB380'}}
          />

          <LinkButton editor={editor} />

          {showTextBlock && (
            <>
              <TextBlockButton onClick={handleTextBlockClick} />

              <Popover
                id={popoverId}
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                PaperProps={{
                  style: {
                    width: '480px',
                    maxHeight: '400px',
                    padding: '1rem',
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16)',
                  },
                }}
                sx={{
                  zIndex: 1300,
                  top: '-3px !important',
                  left: '5px !important',
                }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('Click to apply your block')}
                  </Typography>
                  <TextBlockSelect
                    textBlockCategories={[
                      TextBlockCategory.QUOTATION,
                      TextBlockCategory.ARTICLE_ORDER,
                      TextBlockCategory.INVOICE,
                      TextBlockCategory.SERVICE_ORDER,
                      TextBlockCategory.SERVICE_ORDER_REPORT,
                      TextBlockCategory.EMAIL,
                    ]}
                    setActiveSubDialog={setActiveSubDialog}
                    setActiveTextBlock={setActiveTextBlock}
                    handleCellClick={(params) =>
                      handleCellClick(cleanHtmlContent(params.row.text))
                    }
                    showNewBlockButton={false}
                  />
                </Box>
              </Popover>
            </>
          )}

          {activeSubDialog && (
            <TextBlockActions
              textBlockCategory={TextBlockCategory.INVOICE}
              activeSubDialog={activeSubDialog}
              setActiveSubDialog={setActiveSubDialog}
              openDialog={
                activeSubDialog === 'edit' || activeSubDialog === 'create'
              }
              openPreviewDialog={activeSubDialog === 'preview'}
              openCancelConfirm={activeSubDialog === 'delete'}
              activeTextBlock={activeTextBlock}
              onCloseSubDialogs={onCloseSubDialogs}
            />
          )}
        </Box>

        {hasSignatureButton && (
          <Box display="flex" alignItems="center" marginTop="8px" gap="0.5rem">
            <SignatureButton
              editor={editor}
              signatures={signatures}
              onSignatureSelect={onSignatureSelect}
              updateHtml={updateHtml}
              onChange={onChange}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EditorMenuControls;
