import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import MyDropzone from 'components/MyDropZone';
import {useCallback, useMemo, useRef, useState} from 'react';
import {olStyles} from 'styles';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import {EmptySection} from 'components/EmptySection';
import SearchInput from 'components/SearchInput/index';
import {MenuBtn} from 'components/MenuBtn';
import {FileWithPreview} from 'models/files';
import AttachmentsTable from 'components/Attachments/AttachmentsTable';
import AttachmentsPreview from 'components/Attachments/AttachmentsPreview';
import {
  createAttachmentsTree,
  isAttachmentPreviewableImage,
} from 'utils/attachment';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {
  ALLOWED_ATTACHMENT_FILE_TYPES,
  ATTACHMENT_FILE_HINT,
  ATTACHMENT_LIMIT,
  AttachmentEntityType,
  AttachmentView,
  EntityProps,
} from 'models/attachment';
import useAttachmentActions, {
  useAttachmentButtonMenu,
} from 'hooks/useAttachmentActions';
import {useAttachments} from 'hooks/reactQuery/useAttachment';
import {filterTreeNodes} from 'utils/tree';
import AttachmentUpload from '../AttachmentUpload';

type Props = {
  entityId: string;
  entityType: AttachmentEntityType;
  showEmptySectionButton?: boolean;
  showAddButton?: boolean;
} & EntityProps;

const AttachmentsCard = ({
  entityId,
  entityType,
  showEmptySectionButton = false,
  showAddButton = true,
}: Props) => {
  const {t} = useTranslation();
  const [previewFile, setPreviewFile] = useState<AttachmentView | undefined>(); // loaded attachments
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const textInput = useRef<HTMLInputElement>(null);
  const [isCreatingNewRootFolder, setIsCreatingNewRootFolder] = useState(false);

  const {data: filesResource} = useAttachments({
    entityType,
    entityId,
    isNested: true, // fetch all attachments
    pageSize: ATTACHMENT_LIMIT,
  });
  const files = filesResource?.data ?? [];
  const [parentId, setParentId] = useState<string | undefined>(undefined);

  const attachmentTree = useMemo(() => createAttachmentsTree(files), [files]);

  const filteredTreeNodes = useMemo(() => {
    const originalTree = createAttachmentsTree(files);
    return filterTreeNodes(originalTree.children, search);
  }, [files, search]);

  const treeToRender = search.trim()
    ? filteredTreeNodes
    : attachmentTree.children;

  const {uploadFiles, addFiles, onClearUploadFiles} = useAttachmentActions(
    entityType,
    entityId,
    files.length,
  );

  const fileURIs = files.reduce((acc, current) => {
    if (current.uri) return [...acc, current.uri];
    return acc;
  }, [] as Array<string>);

  const {data: downloadUrls = {}} = useDownloadUrl(fileURIs);

  const handlePreviewFile = (file: AttachmentView) => {
    if (isAttachmentPreviewableImage(file)) {
      setPreviewFile(file);
    } else {
      if (!file.uri) return;
      const url = downloadUrls[file.uri];
      if (url) window.open(url, '_blank');
    }
  };

  const hasFiles = Array.isArray(files) && files.length > 0;
  const hasTreeToRender =
    Array.isArray(treeToRender) && treeToRender.length > 0;
  const isEmpty = !isCreatingNewRootFolder && (!hasFiles || !hasTreeToRender);

  const handleClearParentId = () => {
    if (parentId) setParentId(undefined);
  };

  const handleSave = useCallback(
    async (fileList: FileWithPreview[]) => {
      addFiles(fileList, parentId);
      handleClearParentId();
    },
    [parentId, addFiles],
  );

  const baseMenu = useAttachmentButtonMenu({
    onNewFolder: () => setIsCreatingNewRootFolder(true),
  });

  const menuItemStyle = {
    sx: {
      [`.MuiMenuItem-root`]: {
        [`&:hover `]: {
          [`.MuiListItemIcon-root`]: {
            color: theme.palette.primary.light,
          },
        },
      },
    },
  };

  return (
    <>
      <InfoCard
        containerStyles={{
          [theme.breakpoints.up('md')]: {
            display: 'flex',
            flexDirection: 'column',
            '& .MuiCardHeader-root': {
              marginBottom: 0.5,
            },
          },
        }}
        bodyContainerStyle={{
          maxHeight: '36em',

          [theme.breakpoints.up('md')]: {
            overflowY: 'hidden',
            '&:hover': {
              overflowY: 'auto',
              ...olStyles.verticlaScrollBar,
            },
          },
          [theme.breakpoints.down('md')]: {
            overflowY: 'auto',
          },
        }}
        headerActionIcon={
          showAddButton || files.length ? (
            <AddIcon style={{color: theme.palette.text.primary}} />
          ) : undefined
        }
        showHeaderBackground={false}
        headerIcon={
          <AttachFileIcon
            style={{
              transform: 'rotate(45deg)',
              color: theme.palette.text.secondary,
              width: '2rem',
              height: '2rem',
            }}
          />
        }
        header={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing(4),
            }}>
            <Typography variant="h5" fontWeight={600}>
              {t('Attachments')}
            </Typography>
            <SearchInput
              refInput={textInput}
              defaultValue={search}
              onChange={(val: string) => setSearch(val)}
            />
          </Box>
        }
        headerAction={
          <MenuBtn
            anchorType="iconButton"
            anchorIcon={
              <AddIcon
                sx={{
                  height: '24px',
                  width: '24px',
                  color: theme.palette.primary.dark,
                }}
              />
            }
            menu={baseMenu}
            menuListProps={menuItemStyle}
            size="small"
            color="primary"
            disableRipple
            disableFocusRipple
          />
        }>
        <MyDropzone
          acceptedFileTypes={ALLOWED_ATTACHMENT_FILE_TYPES}
          hint={ATTACHMENT_FILE_HINT}
          getAcceptedFiles={handleSave}
          onFileDialogCancel={handleClearParentId}
          clearFilesAfterSubmit
          isWrapper>
          {isEmpty && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <EmptySection
                label="No attachments yet"
                subLabel="Add attachments to enhance article clarity."
                subLabelProps={{
                  variant: 'body2',
                  color: theme.palette.text.secondary,
                }}
                illustration="file-attachment"
                btnLabel="Add attachments"
                showActionBtn={showEmptySectionButton}
                size="tiny"
                buttonVariant="outlined"
                containerStyle={{
                  height: '100%',
                }}
                buttonComponent={
                  <MenuBtn
                    label="Add attachments"
                    anchorType="button"
                    startIcon={
                      <AddIcon
                        sx={{
                          height: '24px',
                          width: '24px',
                        }}
                      />
                    }
                    menu={baseMenu}
                    size="small"
                    color="primary"
                    sx={{
                      display: 'flex',
                    }}
                    menuListProps={menuItemStyle}
                    disableRipple
                    disableFocusRipple
                    variant="outlined"
                  />
                }
              />
            </Box>
          )}
          {!isEmpty && (
            <Box display="flex" flexDirection="column">
              <TableContainer
                component={Paper}
                sx={{overflow: 'hidden', boxShadow: 'none'}}>
                <AttachmentsTable
                  files={files}
                  tree={treeToRender}
                  isCreatingNewRootFolder={isCreatingNewRootFolder}
                  search={search}
                  entityId={entityId}
                  entityType={entityType}
                  onPreview={handlePreviewFile}
                  setIsCreatingNewRootFolder={setIsCreatingNewRootFolder}
                  setFileUploadParentId={setParentId}
                />
              </TableContainer>
            </Box>
          )}
        </MyDropzone>

        <AttachmentsPreview
          files={files}
          previewFile={previewFile}
          downloadUrls={downloadUrls}
          setPreviewFile={setPreviewFile}
        />
      </InfoCard>
      <AttachmentUpload
        uploadFilesMap={uploadFiles}
        onClose={onClearUploadFiles}
        onRetry={addFiles}
      />
    </>
  );
};

export default AttachmentsCard;
