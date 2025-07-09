import {AttachmentActions, AttachmentView} from 'models/attachment';
import React from 'react';
import {
  aggregateAttachmentRow,
  getAttachmentIndentation,
  getFolderFiles,
  getIconByExtension,
} from 'utils/attachment';
import TableCell from 'components/Table/TableCell';
import TableRow from 'components/Table/TableRow';
import {Box, Typography, useTheme} from '@mui/material';
import Actions from 'components/Attachments/AttachmentsActions';
import {formatDate} from 'utils/datetime';
import ExpandButton from 'components/ExpandButton';
import {formatBytes} from 'utils/file';
import {useTranslation} from 'react-i18next';

type Props = {
  attachment: AttachmentView;
  allAttachments: AttachmentView[];
  depth: number;
  index: string;
  expanded: boolean;
  parentFolderId: string | 'root';
  showRightShadow?: boolean;
  showLeftShadow?: boolean;
  setExpandRow: (attachmentId: string) => void;
  onCreateNewFolder: () => void;
} & AttachmentActions;

const AttachmentTableRow = ({
  attachment,
  allAttachments,
  index,
  depth,
  expanded,
  parentFolderId,
  showRightShadow,
  showLeftShadow,
  setExpandRow,
  onPreview,
  onCreateNewFolder,
  setFileUploadParentId,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const row = aggregateAttachmentRow(attachment);

  const Icon = getIconByExtension({
    name: attachment.fileType || '',
    isFolder: attachment.isFolder,
  });

  const indentation = getAttachmentIndentation(depth);

  return (
    <TableRow
      key={`attachment-row-${row.id}`}
      testId={`attachment-row-${attachment.id}`}>
      <TableCell
        noPadding
        showShadows={showRightShadow ? 'right' : undefined}
        align="right"
        isFirst>
        <Typography sx={{padding: '0px 12px'}} variant="body2">
          {index}
        </Typography>
      </TableCell>
      <TableCell onClick={() => onPreview(attachment)}>
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
              {attachment.isFolder && (
                <ExpandButton
                  expanded={expanded}
                  sx={{background: '#ECF1F3'}}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandRow(attachment.id);
                  }}
                />
              )}

              {Icon}

              <Typography>{row.name}</Typography>
            </Box>

            {attachment.isFolder && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}>
                <Typography
                  variant="subtitle2"
                  sx={{color: theme.palette.text.secondary}}>
                  {getFolderFiles(row.totalFiles || 0, t)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </TableCell>
      <TableCell align="right">
        <Typography>{formatBytes(row.size)}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{formatDate(row.modifiedAt)}</Typography>
      </TableCell>
      <TableCell showShadows={showLeftShadow ? 'left' : undefined} isLast>
        <Actions
          depth={depth}
          attachment={attachment}
          allAttachments={allAttachments}
          parentFolderId={parentFolderId}
          onCreateNewFolder={onCreateNewFolder}
          setFileUploadParentId={setFileUploadParentId}
        />
      </TableCell>
    </TableRow>
  );
};

export default AttachmentTableRow;
