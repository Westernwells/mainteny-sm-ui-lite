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
}

const SignatureButton = ({
  editor,
  signatures,
  onSignatureSelect,
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

      editor
        .chain()
        .focus()
        .insertContent(browserHtml, {
          parseOptions: {preserveWhitespace: false},
        })
        .run();

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
      return;
    }

    setSelectedSignature(value.name);
    setActiveSignature(value);
  };

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
        <Paper sx={{padding: '0em', maxWidth: '200px'}}>
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
