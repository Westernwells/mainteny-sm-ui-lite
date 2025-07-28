import TableBody from '@mui/material/TableBody';
import {ReactNode, useMemo, useRef, useState} from 'react';
import {
  AttachmentActions,
  AttachmentNode,
  AttachmentView,
  CreatingFolderState,
  EntityProps,
  TreeProps,
} from 'models/attachment';
import {ACTION_CELL_WIDTH, TableColumn} from 'models/table';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import AttachmentCreateFolder from 'components/Attachments/AttachmentCreateFolder';
import AttachmentTableRow from '../AttachmentTableRow';

type Props = {
  files: AttachmentView[];
  tree: AttachmentNode[];
  search?: string;
  isCreatingNewRootFolder: boolean;
  setIsCreatingNewRootFolder: (value: boolean) => void;
} & AttachmentActions &
  EntityProps;

const AttachmentsTable = ({
  files,
  tree,
  entityId,
  entityType,
  isCreatingNewRootFolder,
  setIsCreatingNewRootFolder,
  ...actions
}: Props) => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [creatingFolderState, setCreatingFolderState] =
    useState<CreatingFolderState | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const handleCreateFolder = (
    attachment: AttachmentView,
    currentIndex: string,
    depth: number,
  ) => {
    if (attachment.isFolder) {
      setCreatingFolderState({
        parentId: attachment.id,
        depth: depth + 1,
        index: `${currentIndex}.1`,
      });
      if (!expandedRows.includes(attachment.id)) {
        setExpandedRows((current) => [...current, attachment.id]);
      }
    } else if (depth === 0) {
      // root file
      setIsCreatingNewRootFolder(true);
    } else {
      // If it's a file, create at the same level (sibling)
      setCreatingFolderState({
        parentId: attachment.parentId,
        depth,
        index: currentIndex,
      });
    }
  };

  const handleCloseFolderCreation = () => {
    setCreatingFolderState(null);
  };

  const handleExpandRow = (attachmentId: string) => {
    if (!expandedRows.includes(attachmentId)) {
      setExpandedRows((current) => [...current, attachmentId]);
    } else {
      setExpandedRows((current) =>
        current.filter((element) => element !== attachmentId),
      );
    }
  };

  const renderTreeNodes = ({
    nodes,
    parentIndex = '',
    parentId = 'root',
    depth = 0,
  }: TreeProps): ReactNode[] => {
    const elements: ReactNode[] = [];

    nodes.forEach((node, index) => {
      const attachment = node.value === 'root' ? undefined : node.value;
      if (!attachment) return;

      const currentIndex = parentIndex
        ? `${parentIndex}.${index + 1}`
        : `${index + 1}`;

      elements.push(
        <AttachmentTableRow
          key={attachment.id}
          attachment={attachment}
          allAttachments={files}
          expanded={expandedRows.includes(attachment.id)}
          parentFolderId={attachment.isFolder ? attachment.id : parentId}
          showLeftShadow={showLeftShadow}
          showRightShadow={showRightShadow}
          depth={depth}
          index={currentIndex}
          setExpandRow={handleExpandRow}
          onCreateNewFolder={() =>
            handleCreateFolder(attachment, currentIndex, depth)
          }
          {...actions}
        />,
      );

      // If we're creating a folder inside this folder, show the create form
      if (
        creatingFolderState?.parentId === attachment.id &&
        attachment.isFolder
      ) {
        elements.push(
          <AttachmentCreateFolder
            key={`create-folder-${attachment.id}`}
            entityType={entityType}
            entityId={entityId}
            totalAttachments={files.length}
            parentId={creatingFolderState.parentId}
            onClose={handleCloseFolderCreation}
          />,
        );
      }

      if (
        expandedRows.includes(attachment.id) &&
        node.children.length > 0 &&
        attachment.isFolder
      ) {
        const childElements = renderTreeNodes({
          nodes: node.children,
          parentIndex: currentIndex,
          depth: depth + 1,
          parentId: attachment.id,
        });
        elements.push(...childElements);
      }
    });

    return elements;
  };

  const COLUMNS = useMemo<TableColumn[]>(
    () => [
      {
        headerName: '#',
        key: 'attachment-cell-number',
        width: '132px',
        align: 'right',
        showShadows: showRightShadow ? 'right' : undefined,
        isFirst: true,
      },
      {
        headerName: 'Name',
        key: 'position-cell-name',
      },
      {
        headerName: 'Size',
        key: 'attachment-cell-size',
        width: '112px',
        align: 'right',
      },
      {
        headerName: 'Modified',
        key: 'attachment-cell-modified',
        width: '112px',
        align: 'right',
      },
      {
        headerName: 'action',
        key: 'invoice-cell-action',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH,
        isLast: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        noPadding: true,
      },
    ],
    [showLeftShadow, showRightShadow],
  );

  return (
    <TableContainer
      containerRef={containerRef}
      setShowLeftShadow={setShowLeftShadow}
      setShowRightShadow={setShowRightShadow}>
      <TableHeader columns={COLUMNS} />
      <TableBody>
        {isCreatingNewRootFolder && (
          <AttachmentCreateFolder
            entityType={entityType}
            entityId={entityId}
            parentId={undefined}
            totalAttachments={files.length}
            onClose={() => setIsCreatingNewRootFolder(false)}
          />
        )}
        {renderTreeNodes({nodes: tree})}
      </TableBody>
    </TableContainer>
  );
};

export default AttachmentsTable;
