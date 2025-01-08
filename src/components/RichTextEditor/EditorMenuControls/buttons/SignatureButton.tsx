import React, {useState, useRef, useEffect} from 'react';
import {Button, MenuItem, Paper, Popper, Radio} from '@mui/material';
import {ChevronLeftOutlined} from '@mui/icons-material';
import {EmailSignature} from 'models/employee';
import {useTranslation} from 'react-i18next';
import {Editor} from '@tiptap/react';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {generateSignatureHtml} from 'utils/rich-field-string';

interface SignatureButtonProps {
  editor: Editor | null;
  signatures?: EmailSignature[];
  onSignatureSelect?: (signature?: EmailSignature) => void;
  updateHtml?: (value: string) => void;
  onChange?: (value: string) => void;
}

const SignatureButton = ({
  editor,
  signatures,
  onSignatureSelect,
  updateHtml,
  onChange,
}: SignatureButtonProps) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  const [selectedSignature, setSelectedSignature] =
    useState<string>('No Signature');
  const [activeSignature, setActiveSignature] = useState<EmailSignature>();
  const [openDropdown, setOpenDropdown] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const {refetch} = useDownloadUrl(
    activeSignature?.content.images || [],
    undefined,
    serviceCompanyId,
  );

  useEffect(() => {
    const updateEditorWithSignature = async () => {
      if (!activeSignature || !editor) return;

      const {data} = await refetch();

      const logoUrl = activeSignature.content.images[0]
        ? data?.[activeSignature.content.images[0]]
        : '';

      const browserHtml = generateSignatureHtml(
        activeSignature,
        true,
        logoUrl!,
      );

      const editorContent = editor.getHTML();

      const finalContent = `${editorContent}<br />${browserHtml}`;

      editor.chain().focus().setContent(finalContent).run();

      updateHtml?.(finalContent);
      onChange?.(finalContent);

      onSignatureSelect?.(activeSignature);
    };

    updateEditorWithSignature();
  }, [activeSignature]);

  const handleSignatureChange = (value: EmailSignature | null) => {
    if (!editor) return;

    setOpenDropdown(false);

    if (!value) {
      setSelectedSignature('No Signature');
      setActiveSignature(undefined);

      const editorContent = editor.getHTML();

      // Create a DOM parser to manipulate the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(editorContent, 'text/html');

      // Find and remove the signature table (or any specific element)
      const signatureTable = doc.querySelector('table');
      if (signatureTable) {
        signatureTable.remove();
      }

      // Serialize the updated HTML back to a string
      const updatedContent = doc.body.innerHTML;

      // Update the editor content
      editor.chain().focus().setContent(updatedContent).run();
      return;
    }

    setSelectedSignature(value.name);
    setActiveSignature(value);
  };

  useEffect(() => {
    const filteredSignature = signatures?.find(
      (signature) => signature.enabled,
    );

    if (filteredSignature) {
      handleSignatureChange(filteredSignature);
    }
  }, [signatures]);

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => setOpenDropdown((prev) => !prev)}
        variant="text"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: 'auto',
          fontSize: '0.8rem',
        }}>
        {t(selectedSignature)}
        <span
          style={{
            transform: openDropdown ? 'rotate(90deg)' : 'rotate(270deg)',
            transition: 'transform 0.3s',
          }}>
          <ChevronLeftOutlined />
        </span>
      </Button>

      <Popper
        open={openDropdown}
        anchorEl={buttonRef.current}
        placement="top-end"
        style={{
          zIndex: 1300,
          position: 'absolute',
          right: 0,
        }}>
        <Paper sx={{padding: '0em', minWidth: '200px'}}>
          <MenuItem
            value="No Signature"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: selectedSignature === 'No Signature' ? '600' : '400',
              color:
                selectedSignature === 'No Signature' ? '#000034' : '#828DA3',
              padding: '0.5em 3em 0.5em 0.5em',
            }}
            onClick={() => handleSignatureChange(null)}>
            <Radio
              checked={selectedSignature === 'No Signature'}
              value="No Signature"
            />
            {t('No Signature')}
          </MenuItem>

          {signatures?.map((sig) => (
            <MenuItem
              key={sig.id}
              value={sig.content.html}
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontWeight: selectedSignature === sig.name ? '600' : '400',
                color: selectedSignature === sig.name ? '#000034' : '#828DA3',
                padding: '0.5em 3em 0.5em 0.5em',
              }}
              onClick={() => handleSignatureChange(sig)}>
              <Radio
                checked={selectedSignature === sig.name}
                value={sig.name}
              />
              {sig.name}
            </MenuItem>
          ))}
        </Paper>
      </Popper>
    </>
  );
};

export default SignatureButton;
