import React from 'react';
import {getAttachmentIndentation, getIconByExtension} from 'utils/attachment';
import TableCell from 'components/Table/TableCell';
import TableRow from 'components/Table/TableRow';
import {Box, IconButton, Typography, useTheme} from '@mui/material';
import {formatDate} from 'utils/datetime';
import useAttachmentActions from 'hooks/useAttachmentActions';
import {EntityProps} from 'models/attachment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OutlinedInput from '@mui/material/OutlinedInput';
import {useTranslation} from 'react-i18next';

type Props = {
  parentId?: string;
  depth?: number;
  index?: string;
  totalAttachments: number;
  showRightShadow?: boolean;
  showLeftShadow?: boolean;
  onClose: () => void;
} & EntityProps;

const AttachmentCreateFolder = ({
  index,
  depth = 0,
  parentId,
  entityType,
  entityId,
  totalAttachments,
  showLeftShadow,
  showRightShadow,
  onClose,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {addFolder} = useAttachmentActions(
    entityType,
    entityId,
    totalAttachments,
  );

  const [folderName, setFolderName] = React.useState<string>('');
  const FolderIcon = getIconByExtension({
    name: '',
    isFolder: true,
  });

  const indentation = getAttachmentIndentation(depth);

  const handleCreateNewFolder = () => {
    addFolder({
      entityType,
      entityId,
      parentId,
      name: folderName,
    });
    onClose();
  };

  return (
    <TableRow
      sx={{padding: 0}}
      key="attachment-row-create-folder"
      testId="attachment-row-create-folder">
      <TableCell
        noPadding
        showShadows={showRightShadow ? 'right' : undefined}
        align="right"
        isFirst>
        <Typography sx={{padding: '0px 12px'}} variant="body2">
          {index}
        </Typography>
      </TableCell>
      <TableCell>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0px 12px',
            paddingLeft: `${indentation}px}`,
          }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              width: '100%',
              paddingRight: '6px',
            }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
              {FolderIcon}

              <OutlinedInput
                sx={{
                  height: '22px',

                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },

                  '& .MuiOutlinedInput-input': {
                    backgroundColor: 'transparent',
                    padding: 0,
                  },

                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },

                  backgroundColor: 'transparent',
                }}
                placeholder={t('Enter folder name...')}
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing(1.5),
              }}>
              <IconButton
                sx={{height: '24px', width: '24px'}}
                onClick={onClose}>
                <CancelIcon sx={{color: theme.palette.error.light}} />
              </IconButton>
              <IconButton
                sx={{height: '24px', width: '24px'}}
                disabled={folderName.length === 0}
                onClick={handleCreateNewFolder}>
                <CheckCircleIcon
                  sx={{
                    color:
                      folderName.length === 0
                        ? theme.palette.text.disabled
                        : theme.palette.success.main,
                  }}
                />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </TableCell>
      <TableCell align="right">
        <Typography>-</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{formatDate(new Date())}</Typography>
      </TableCell>
      <TableCell showShadows={showLeftShadow ? 'left' : undefined} isLast />
    </TableRow>
  );
};

export default AttachmentCreateFolder;
