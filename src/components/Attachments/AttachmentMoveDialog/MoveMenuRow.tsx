import React, {Fragment} from 'react';
import {
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import ExpandButton from 'components/ExpandButton';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import {getFolderFiles} from 'utils/attachment';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {AttachmentView} from 'models/attachment';

type Props = {
  folder: AttachmentView;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  isSelected: boolean;
  onToggleExpand: (folderId: string) => void;
  onSelectFolder: (folderId: string) => void;
};
const MoveMenuRow = ({
  folder,
  depth,
  isExpanded,
  hasChildren,
  isSelected,
  onToggleExpand,
  onSelectFolder,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const fileCount = folder.totalFiles || 0;

  return (
    <Fragment key={`folder-row-${folder.id}`}>
      <ListItem
        disablePadding
        sx={{
          backgroundColor: 'transparent',
          borderRadius: 1,
          border: '2px solid transparent',

          ...(isSelected && {
            backgroundColor: theme.palette.inputBackground.main,
            borderColor: theme.palette.primary.light,
          }),
        }}>
        <ListItemButton
          onClick={() => onSelectFolder(folder.id)}
          sx={{
            padding: '9px 12px',
            paddingLeft: `${depth * 26 + 9}px`,
            borderRadius: 1,
            gap: theme.spacing(0.75),

            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}>
          <ListItemIcon sx={{minWidth: 20}}>
            {hasChildren && (
              <ExpandButton
                expanded={isExpanded}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(folder.id);
                }}
              />
            )}

            {isSelected ? (
              <FolderIcon sx={{color: theme.palette.primary.light}} />
            ) : (
              <FolderOpenIcon />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Typography variant="body2">{folder.name}</Typography>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                  <Typography variant="caption" color="text.secondary">
                    {getFolderFiles(fileCount, t)}
                  </Typography>
                </Box>
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
    </Fragment>
  );
};

export default MoveMenuRow;
