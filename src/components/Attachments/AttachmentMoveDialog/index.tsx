import React, {
  Fragment,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {Button} from 'components/Button';
import useTheme from '@mui/material/styles/useTheme';
import {AttachmentNode, AttachmentView} from 'models/attachment';
import {createAttachmentsTree, getFolderFiles} from 'utils/attachment';
import MoveMenuRow from 'components/Attachments/AttachmentMoveDialog/MoveMenuRow';
import SubdirectoryArrowRight from '@mui/icons-material/SubdirectoryArrowRight';

type Props = {
  open?: boolean;
  title?: string;
  selectedFiles?: AttachmentView[];
  allAttachments: AttachmentView[];
  selectedFolderId?: string;
  confirmBtnLabel?: string;
  closeBtnLabel?: string;
  disableActions?: boolean;
  maxWidth?: string | number;
  onConfirm: (folderId: string) => void;
  onClose: () => void;
};

const AttachmentMoveDialog = ({
  open = false,
  title = 'Move to',
  selectedFiles = [],
  allAttachments,
  selectedFolderId,
  closeBtnLabel = 'Cancel',
  confirmBtnLabel = 'Move',
  disableActions = false,
  maxWidth = '500px',
  onConfirm,
  onClose,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(
    selectedFolderId,
  );

  const folderTree = useMemo(
    () => createAttachmentsTree(allAttachments.filter((f) => f.isFolder)),
    [allAttachments],
  );

  const handleToggleExpand = useCallback(
    (folderId: string) => {
      setExpandedFolders((prev) =>
        prev.includes(folderId)
          ? prev.filter((id) => id !== folderId)
          : [...prev, folderId],
      );
    },
    [setExpandedFolders],
  );

  const handleSelectFolder = useCallback(
    (folderId: string | undefined) => {
      setSelectedFolder(folderId);
    },
    [setSelectedFolder],
  );

  const handleConfirm = useCallback(() => {
    if (!selectedFolder) return;
    onConfirm(selectedFolder);
  }, [selectedFolder]);

  const renderFolderNode = (
    node: AttachmentNode,
    depth: number = 0,
  ): ReactNode => {
    const folder = node.value === 'root' ? undefined : node.value;
    if (!folder) {
      return node.children.map((child) => renderFolderNode(child, depth));
    }

    const isExpanded = expandedFolders.includes(folder.id);
    const hasChildren = node.children.length > 0;

    return (
      <Fragment key={`folder-node-${folder.id}`}>
        <MoveMenuRow
          folder={folder}
          depth={depth}
          isExpanded={isExpanded}
          isSelected={selectedFolder === folder.id}
          hasChildren={hasChildren}
          onToggleExpand={handleToggleExpand}
          onSelectFolder={handleSelectFolder}
        />

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {node.children.map((child) => renderFolderNode(child, depth + 1))}
          </Collapse>
        )}
      </Fragment>
    );
  };

  const selectedFilesCount = selectedFiles.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="move-dialog-title"
      sx={{
        '& .MuiDialog-paper': {
          maxWidth,
          width: '100%',
          maxHeight: '70vh',
        },
      }}>
      <DialogTitle
        id="move-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}>
        <Box>
          <Typography variant="h6" component="div">
            {t(title)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
            {selectedFilesCount === 1 &&
              t('Select a folder to move your 1 selected file to.')}
            {selectedFilesCount > 1 &&
              t(
                'Select a folder to move your {{selectedFilesCount}} selected files to.',
                {
                  selectedFilesCount,
                },
              )}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{padding: '9px 12px'}}>
        <Box
          sx={{
            px: 3,
            py: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
          <Typography variant="subtitle2" sx={{fontWeight: 600}}>
            {t('Name')}
          </Typography>
        </Box>

        <Fragment key="root-row">
          <ListItem
            disablePadding
            sx={{
              backgroundColor: 'transparent',
              borderRadius: 1,
              border: '2px solid transparent',

              ...(selectedFolder === 'root' && {
                backgroundColor: theme.palette.inputBackground.main,
                borderColor: theme.palette.primary.light,
              }),
            }}>
            <ListItemButton
              onClick={() => handleSelectFolder('root')}
              sx={{
                padding: '9px 12px',
                borderRadius: 1,
                gap: theme.spacing(0.75),

                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}>
              <ListItemIcon sx={{minWidth: 20}}>
                <SubdirectoryArrowRight
                  sx={{
                    color:
                      selectedFolder === 'root'
                        ? theme.palette.primary.light
                        : theme.palette.text.secondary,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Typography variant="body2">
                      {t('Root directory')}
                    </Typography>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                      <Typography variant="caption" color="text.secondary">
                        {getFolderFiles(allAttachments.length, t)}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        </Fragment>

        <List sx={{maxHeight: '400px'}}>
          {folderTree.children.map((node) => renderFolderNode(node))}
        </List>
      </DialogContent>

      <DialogActions sx={{padding: '1em', gap: theme.spacing(2)}}>
        <Button
          disabled={disableActions}
          buttonProps={{
            onClick: onClose,
            size: 'medium',
          }}>
          <Typography variant="subtitle2" color="primary.dark">
            {t(closeBtnLabel)}
          </Typography>
        </Button>

        <Button
          disabled={disableActions || !selectedFolder}
          buttonProps={{
            onClick: handleConfirm,
            autoFocus: true,
            size: 'medium',
            variant: 'contained',
            sx: {
              py: '6px',
              px: '16px',
            },
          }}>
          <Typography variant="subtitle2">{t(confirmBtnLabel)}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentMoveDialog;
