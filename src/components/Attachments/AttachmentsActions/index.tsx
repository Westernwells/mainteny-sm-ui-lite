import {Trans} from 'react-i18next';
import TableActionMenu from 'components/Table/TableActionMenu';
import {useAttachmentTableButtonMenu} from 'hooks/useAttachmentActions';
import {AttachmentActions, AttachmentView} from 'models/attachment';
import {SyntheticEvent, useState} from 'react';
import {Confirm} from 'components/Confirm';
import {
  useDeleteAttachment,
  useMoveAttachment,
  useUpdateAttachment,
} from 'hooks/reactQuery/useAttachment';
import InputDialog from 'components/InputDialog';
import useTheme from '@mui/material/styles/useTheme';
import AttachmentMoveDialog from 'components/Attachments/AttachmentMoveDialog';

type Props = {
  attachment: AttachmentView;
  allAttachments: AttachmentView[];
  parentFolderId: string | 'root';
  depth: number;
  onCreateNewFolder: () => void;
} & Pick<AttachmentActions, 'setFileUploadParentId'>;

const Actions = ({
  attachment,
  allAttachments,
  parentFolderId,
  depth,
  onCreateNewFolder,
  setFileUploadParentId,
}: Props) => {
  const theme = useTheme();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);

  const {mutateAsync: handleDelete} = useDeleteAttachment();
  const {mutateAsync: handleUpdate} = useUpdateAttachment(
    'Attachment was updated successfully.',
  );
  const {mutateAsync: handleMove} = useMoveAttachment();

  const handleDeleteConfirm = (e: SyntheticEvent) => {
    e.stopPropagation();
    handleDelete({id: attachment.id});
    setIsDeleteDialogOpen(false);
  };

  const handleMoveFile = (parentId: string) => {
    handleMove({
      attachmentId: attachment.id,
      parentId: parentId !== 'root' ? parentId : null,
    });
    setIsDeleteDialogOpen(false);
  };

  const handleRenameConfirm = (value: string) => {
    handleUpdate({
      id: attachment.id,
      attachmentName: value,
    });
    setIsRenameDialogOpen(false);
  };

  const OPTIONS = useAttachmentTableButtonMenu({
    depth: attachment.isFolder ? depth + 1 : depth,
    onNewFolder: onCreateNewFolder,
    onMove: () => setIsMoveDialogOpen(true),
    onRename: () => {
      setIsRenameDialogOpen(true);
    },
    onDelete: () => {
      setIsDeleteDialogOpen(true);
    },
    onAddFile: () => {
      if (parentFolderId !== 'root') setFileUploadParentId(parentFolderId);
    },
  });

  const menuItemPros = {
    sx: {
      '&.MuiMenuItem-root:hover .MuiListItemIcon-root': {
        color: theme.palette.primary.light,
      },
    },
  };

  return (
    <>
      <TableActionMenu options={OPTIONS} itemProps={menuItemPros} />
      {isDeleteDialogOpen && (
        <Confirm
          open={isDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          onClose={() => setIsDeleteDialogOpen(false)}
          title="Delete this file?"
          content={
            <Trans
              defaults="You are about to delete <bold>{{fileName}}</bold> file from your attachments."
              values={{fileName: attachment.name}}
              components={{bold: <strong />}}
            />
          }
          helperText="Are you sure about it?"
        />
      )}

      {isMoveDialogOpen && (
        <AttachmentMoveDialog
          open={isMoveDialogOpen}
          allAttachments={allAttachments}
          onConfirm={(folderId: string) => {
            handleMoveFile(folderId);
            setIsMoveDialogOpen(false);
          }}
          onClose={() => setIsMoveDialogOpen(false)}
        />
      )}

      {isRenameDialogOpen && (
        <InputDialog
          open={isRenameDialogOpen}
          value={attachment.name}
          title="Rename"
          onConfirm={handleRenameConfirm}
          onClose={() => setIsRenameDialogOpen(false)}
        />
      )}
    </>
  );
};

export default Actions;
