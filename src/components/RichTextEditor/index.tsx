import {
  Box,
  InputLabel,
  FormControl,
  Typography,
  IconButton,
} from '@mui/material';
import {EditorProvider} from '@tiptap/react';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Control, Controller} from 'react-hook-form';
import {FileWithPreview, MyDropZone} from 'components/MyDropZone/MyDropzone';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import {ONE_KB_IN_BYTES, ONE_MB_IN_BYTES} from 'utils/constants';
import CircularProgress from '@mui/material/CircularProgress';
import {cleanHtmlContent} from 'utils/text-block';
import {EmailSignature} from 'models/employee';
import EditorMenuControls from './EditorMenuControls';
import useExtensions from './useExtensions';

const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/tab-separated-values',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/bmp',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/xml',
];

interface AttachedFilesProps {
  files: FileWithPreview[];
  removeFile: ((fileKey: string) => void) | undefined;
  isLoadingFiles?: boolean;
  hasAttachFileButton?: boolean;
}
const AttachedFiles = ({
  files = [],
  removeFile,
  isLoadingFiles,
  hasAttachFileButton,
}: AttachedFilesProps) => {
  const {t} = useTranslation();
  const handleFilePreview = (file: FileWithPreview) => {
    const fileUrl = URL.createObjectURL(
      new Blob([file], {
        type: SUPPORTED_FILE_TYPES.includes(file.type)
          ? file.type
          : 'application/pdf',
      }),
    );

    window.open(fileUrl, '_blank');
  };

  if (!files.length && !isLoadingFiles && hasAttachFileButton)
    return <Typography>{t('Failed to load PDF file')}</Typography>;

  return isLoadingFiles ? (
    <Box display="flex">
      <CircularProgress sx={{color: 'primary.mainLight'}} size="1.5rem" />
    </Box>
  ) : (
    <Box
      sx={{
        display: 'flex',
        gap: '1.5rem',
        width: '100%',
        flexWrap: 'wrap',
      }}>
      {files.map((file, index) => (
        <Box
          key={index}
          sx={{
            position: 'relative',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            '&:hover': {
              [`.clear_${index}`]: {
                display: 'block',
              },
            },
          }}>
          <Box
            onClick={() => handleFilePreview(file)}
            sx={{
              borderRadius: '4px',
              border: '1px solid #222B451F',
              padding: '5px',
              background: 'white',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}>
            {file.type.includes('image') ? (
              <ImageOutlinedIcon sx={{color: 'text.secondary'}} />
            ) : (
              <InsertDriveFileOutlinedIcon sx={{color: 'text.secondary'}} />
            )}
          </Box>
          <Typography sx={{wordBreak: 'break-all', maxWidth: '250px'}}>
            {file.description || file?.name}
          </Typography>
          <Box position="relative">
            <Typography variant="caption" color="text.secondary" mr={3}>
              (
              {file.size >= ONE_MB_IN_BYTES
                ? `${(file.size / ONE_MB_IN_BYTES).toFixed(2)} MB`
                : `${(file.size / ONE_KB_IN_BYTES).toFixed(2)} KB`}
              )
            </Typography>
            <IconButton
              className={`clear_${index}`}
              sx={{
                display: 'none',
                padding: 0,
                position: 'absolute',
                right: 0,
                top: 0,
              }}
              onClick={() => {
                removeFile?.(`${file.name}_${index}`);
              }}>
              <ClearOutlinedIcon />
            </IconButton>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

interface Props {
  required?: boolean;
  label: string;
  placeholder?: string;
  html?: string;
  updateHtml?: (value: string) => void;
  name?: string;
  control?: Control<any>;
  existingFiles?: FileWithPreview[];
  updateFiles?: (files: FileWithPreview[]) => void;
  isLoadingFiles?: boolean;
  hasAttachFileButton?: boolean;
  hasSignatureButton?: boolean;
  onSignatureSelect?: (signature?: EmailSignature) => void;
}
const RichTextEditor = ({
  required = false,
  label,
  placeholder = '',
  html = '',
  updateHtml,
  name,
  control,
  existingFiles = [],
  isLoadingFiles = false,
  updateFiles,
  hasAttachFileButton,
  hasSignatureButton = false,
  onSignatureSelect,
}: Props) => {
  const {t} = useTranslation();
  const dropzoneRef = useRef<{
    open: () => void;
    removeFile: (fileKey: string) => void;
    files: FileWithPreview[];
  }>(null);

  const extensions = useExtensions({placeholder});
  const [focused, setFocused] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>(existingFiles);
  useEffect(() => {
    setFiles(existingFiles);
  }, [existingFiles]);

  const renderEditor = (value: string, onChange: (value: string) => void) => (
    <EditorProvider
      slotAfter={
        <>
          <Box margin="1rem 0">
            <AttachedFiles
              isLoadingFiles={isLoadingFiles}
              files={files}
              removeFile={dropzoneRef?.current?.removeFile}
              hasAttachFileButton={false}
            />
          </Box>
          <EditorMenuControls
            onOpenFileUpload={() => dropzoneRef?.current?.open()}
            hasAttachFileButton={hasAttachFileButton}
            hasSignatureButton={hasSignatureButton}
            onSignatureSelect={onSignatureSelect}
            updateHtml={updateHtml}
            onChange={onChange}
          />
        </>
      }
      extensions={extensions}
      content={value}
      onUpdate={({editor}) => {
        const cleanedHtml = cleanHtmlContent(editor.getHTML());
        updateHtml?.(cleanedHtml);
        onChange(cleanedHtml);
      }}
    />
  );

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel
        sx={{
          background: 'white',
          padding: '0 0.3rem',
          lineHeight: 1,
          top: '5px',
        }}
        shrink
        focused={focused}
        required={required}>
        {t(label)}
      </InputLabel>
      <Box
        sx={{
          border: '1px solid',
          borderColor: focused ? 'primary.main' : 'grey.400',
          borderRadius: 1,
          padding: 2,
          paddingBottom: '0.8rem',
          '&:hover': {
            borderColor: 'primary.main',
          },
          '& .Mui-focused': {
            borderColor: 'primary.main',
          },
          '& .MuiInputLabel-shrink': {
            transform: 'translate(14px, -6px) scale(0.75)',
          },
          '& .ProseMirror': {
            '& *': {
              marginBlockStart: 0,
              marginBlockEnd: 0,
            },
          },
          '& .ProseMirror-focused': {
            outline: 'none',
          },
          '& .ProseMirror ul, .ProseMirror ol': {
            marginLeft: '20px',
            listStylePosition: 'inside',
          },
          '& .ProseMirror ul': {
            listStyleType: 'disc',
          },
          '& .ProseMirror ol': {
            listStyleType: 'decimal',
          },
          '& .ProseMirror li p': {
            display: 'inline-flex',
            margin: 0,
            padding: 0,
          },
          '& .ProseMirror a': {
            color: '#0092B2 !important',
            textDecoration: 'underline',
          },
          '& .ProseMirror a:hover': {
            textDecoration: 'underline',
          },
          '& .tiptap p.is-editor-empty:first-of-type::before': {
            color: '#adb5bd',
            content: 'attr(data-placeholder)',
            float: 'left',
            height: '0',
            pointerEvents: 'none',
            position: 'absolute',
          },
          '& .ProseMirror table': {
            width: '100%',
          },
          '& .ProseMirror table tbody': {
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          },
          '& .ProseMirror table tbody tr': {
            width: '100%',
          },
          '& .ProseMirror table tbody tr td:nth-of-type(1)': {
            width: '100px',
            verticalAlign: 'top',
            paddingRight: '1em',
          },
          '& .ProseMirror table tbody tr td:nth-of-type(1):has(p:empty), & .ProseMirror table tbody tr td:nth-of-type(1):has(p br)':
            {
              width: '0px', // Collapse width for an "empty" first <td>
            },
          '& .ProseMirror table tbody tr td:nth-of-type(1):has(p:empty) + td, & .ProseMirror table tbody tr td:nth-of-type(1):has(p br) + td':
            {
              width: '100%', // Make the second <td> take the full width when the first <td> is "empty"
            },
          '& .ProseMirror table tbody tr td:nth-of-type(2)': {
            width: '93%', // When the first <td> contains meaningful content (like an image)
          },

          background: '#F7F9FC',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}>
        <MyDropZone
          isWrapper
          existingFiles={existingFiles}
          ref={dropzoneRef}
          acceptedFileTypes={SUPPORTED_FILE_TYPES}
          hint="JPEG, PNG, BMP, GIF, PDF, DOC, DOCX, TXT or SVG"
          getAcceptedFiles={(filesList) => {
            setFiles(filesList);
            updateFiles?.(filesList);
          }}>
          {control && name ? (
            <Controller
              name={name}
              control={control}
              defaultValue={html}
              render={({field: {onChange, value}}) =>
                renderEditor(value, onChange)
              }
            />
          ) : (
            renderEditor(html, () => {})
          )}
        </MyDropZone>
      </Box>
    </FormControl>
  );
};

export default RichTextEditor;
