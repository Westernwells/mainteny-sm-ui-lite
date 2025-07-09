import {FileResource} from 'models/media';
import {
  ATTACHMENT_FILE_TO_TYPE_MAP,
  AttachmentFileType,
  AttachmentNode,
  AttachmentS3PathGeneratorProps,
  AttachmentTableRow,
  AttachmentView,
  CreateAttachmentQuery,
  CreateFileProps,
  CreateFolderProps,
} from 'models/attachment';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import React from 'react';
import {toRestDateTime} from 'utils/datetime';
import {toCamelCase} from 'utils/string';
import {TFunction} from 'i18next';

export const isPreviewableImage = (file: FileResource) => {
  if (!file || !file.type) return false;
  const type = file.type.toLowerCase();
  return (
    type.startsWith('image/') && !['image/tiff', 'image/tif'].includes(type)
  );
};

export const isAttachmentPreviewableImage = (file: AttachmentView) => {
  if (!file || !file.fileType || file.isFolder) return false;
  const type = file.fileType.toLowerCase();
  return (
    type.startsWith('image/') && !['image/tiff', 'image/tif'].includes(type)
  );
};

export const createAttachmentsTree = (
  files: AttachmentView[],
): AttachmentNode => {
  const nodeMap = new Map<string, AttachmentNode>();
  const rootChildren: AttachmentNode[] = [];

  // First pass: create all nodes
  files.forEach((item) => {
    const node: AttachmentNode = {
      value: item,
      children: [],
    };

    // Assuming your value object has an id property
    // If not, you'll need to modify this based on your object structure
    const nodeId = item.id;
    if (nodeId) {
      nodeMap.set(nodeId, node);
    }
  });

  // Second pass: build the tree structure
  files.forEach((item) => {
    const nodeId = item.id;
    const node = nodeMap.get(nodeId);

    if (node) {
      if (item.parentId === undefined || item.parentId === null) {
        // Root level item
        rootChildren.push(node);
      } else {
        // Child item - find parent and add to its children
        const parent = nodeMap.get(item.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent not found, treat as root level
          rootChildren.push(node);
        }
      }
    }
  });

  // Return the root node
  return {
    value: 'root',
    children: rootChildren,
  };
};

export const getAttachmentTypeFromName = (
  value: string,
  isFolder: boolean,
): AttachmentFileType => {
  if (isFolder) return AttachmentFileType.FOLDER;

  const typeSplit = value.split('/');
  const extension = typeSplit[typeSplit.length - 1];

  return ATTACHMENT_FILE_TO_TYPE_MAP[extension] || 'OTHER';
};

export const getIconByExtension = ({
  name,
  isFolder,
}: Pick<AttachmentView, 'name' | 'isFolder'>) => {
  const fileType = getAttachmentTypeFromName(name, isFolder);

  switch (fileType) {
    case AttachmentFileType.FOLDER:
      return <FolderOpenOutlinedIcon sx={{width: 20, height: 20}} />;
    case AttachmentFileType.TEXT:
      return <TextSnippetOutlinedIcon sx={{width: 20, height: 20}} />;
    case AttachmentFileType.IMAGE:
      return (
        <ImageOutlinedIcon sx={{width: 20, height: 20}} fontSize="medium" />
      );
    case AttachmentFileType.PDF:
      return <PictureAsPdfOutlinedIcon sx={{width: 20, height: 20}} />;
    default:
      return <DashboardOutlinedIcon sx={{width: 20, height: 20}} />;
  }
};

export const aggregateAttachmentRow = (
  attachment: AttachmentView,
): AttachmentTableRow => ({
  data: attachment,
  id: attachment.id,
  name: attachment.name,
  size: attachment.size,
  modifiedAt: attachment.meta.lastUpdatedAt,
  totalFiles: attachment.totalFiles,
});

export const aggregateAttachmentRows = (
  attachments: AttachmentView[],
): AttachmentTableRow[] => attachments.map(aggregateAttachmentRow);

export const getAttachmentS3Path = ({
  serviceCompanyId,
  entityType,
  entityId,
  name,
}: AttachmentS3PathGeneratorProps) => {
  const timestamp = toRestDateTime(new Date());
  const generatedName = `${timestamp}_${name}`;
  const generatedEntityType = toCamelCase(entityType);
  return `${serviceCompanyId}/${generatedEntityType}/${entityId}/${generatedName}`;
};

export const createFolderObject = (
  props: Omit<CreateFolderProps, 'isFolder'>,
): Omit<CreateAttachmentQuery, 'serviceCompanyId'> => ({
  ...props,
  isFolder: true,
});

export const createFileObject = (
  file: Omit<CreateFileProps, 'isFolder'>,
): Omit<CreateAttachmentQuery, 'serviceCompanyId'> => ({
  ...file,
  isFolder: false,
});

export const getAttachmentIndentation = (depth: number) => 12 + 26 * depth; // 12 is the padding and 26 is the step

export const getFolderFiles = (
  fileCount: number,
  t: TFunction<'translation', undefined>,
) => {
  if (fileCount === 0) return t('Empty');
  if (fileCount === 1) return t('1 file');

  return t('{{numberOfFiles}} files', {
    numberOfFiles: fileCount,
  });
};

export const getUploadId = (file: File) => `upload-${file.name}`;
