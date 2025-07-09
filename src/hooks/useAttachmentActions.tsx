import {useCreateAttachment} from 'hooks/reactQuery/useAttachment';
import {
  ATTACHMENT_DEPTH_LIMIT,
  ATTACHMENT_LIMIT,
  AttachmentEntityType,
  AttachmentFileType,
  CreateFolderProps,
  UploadFile,
  UploadStatus,
} from 'models/attachment';
import {MenuBtnProps} from 'models/misc';
import AddIcon from '@mui/icons-material/Add';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import {MenuAction} from 'models/action';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import React, {useCallback, useMemo, useState} from 'react';
import {useDropzoneContext} from 'context/DropzoneProvider';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {FileWithPreview} from 'models/files';
import {
  createFileObject,
  createFolderObject,
  getAttachmentS3Path,
  getAttachmentTypeFromName,
  getUploadId,
} from 'utils/attachment';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {resizeImageToTargetSize} from 'utils/image-compression';
import {IMAGE_SIZE_IN_MB} from 'utils/constants';
import {useSnackbar} from 'hooks/useSnackbar';
import {useTranslation} from 'react-i18next';
import {getVirtualPath, isFileWithoutFolders} from 'utils/file';

const useAttachmentActions = (
  entityType: AttachmentEntityType,
  entityId: string,
  totalAttachments: number,
) => {
  const {user} = useUserSession();
  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();
  const {mutateAsync: addAttachment} = useCreateAttachment();

  const {mutateAsync: uploadImages} = useUploadFiles();

  const [uploadFiles, setUploadFiles] = useState<Map<string, UploadFile>>(
    new Map(),
  );

  const countTotalAttachments = (files: FileWithPreview[]): number => {
    if (!Array.isArray(files) || files.length === 0) {
      return 0;
    }

    const folderSet = new Set<string>();

    files.forEach((file) => {
      const filePath = file.relativePath ?? file.path ?? file.name;
      const parts = filePath.split('/').filter((p) => p.length > 0);

      if (parts.length > 1) {
        parts.slice(0, -1).reduce((acc, segment) => {
          const next = acc ? `${acc}/${segment}` : segment;
          folderSet.add(next);
          return next;
        }, '');
      }
    });
    return files.length + folderSet.size;
  };

  const validateFolderDepth = (files: FileWithPreview[]) => {
    files.forEach((file) => {
      const filePath = file.relativePath || file.path || file.name;
      const pathParts = filePath.split('/').filter((part) => part.length > 0);
      const folderDepth = pathParts.length - 1;

      if (folderDepth > ATTACHMENT_DEPTH_LIMIT) {
        enqueueSnackbar(
          t(
            'File "{{fileName}}" exceeds maximum folder depth of {{maxDepth}} levels',
            {
              fileName: file.name,
              maxDepth: ATTACHMENT_DEPTH_LIMIT,
            },
          ),
          {variant: 'error'},
        );
        throw new Error('Folder depth exceeded');
      }
    });
  };

  const validateLimit = (files: FileWithPreview[]) => {
    const totalNewAttachments = countTotalAttachments(files);

    if (totalAttachments + totalNewAttachments > ATTACHMENT_LIMIT) {
      enqueueSnackbar(
        t('Attachment limit of {{limit}} files reached', {
          limit: ATTACHMENT_LIMIT,
        }),
        {variant: 'error'},
      );
      throw new Error('Attachment limit exceeded');
    }
  };

  const handleAddUploadFile = (file: FileWithPreview, parentId?: string) => {
    const uploadId = getUploadId(file);
    const uploadFilesData: UploadFile = {
      id: uploadId,
      file,
      parentId,
      name: file.name,
      status: UploadStatus.PENDING,
    };

    setUploadFiles((currentMap) => {
      const newUploadMap = new Map(currentMap);
      newUploadMap.set(uploadId, uploadFilesData);
      return newUploadMap;
    });
  };

  const handleUpdateUploadStatus = (
    fileId: string,
    status: UploadStatus,
    error?: string,
  ) => {
    setUploadFiles((currentMap) => {
      const foundFile = currentMap.get(fileId);
      if (!foundFile) return currentMap;
      const newUploadMap = new Map(currentMap);
      newUploadMap.set(fileId, {
        ...foundFile,
        status,
        error,
      });
      return newUploadMap;
    });
  };

  const handleClearUploadFiles = () => {
    setUploadFiles(new Map<string, UploadFile>([]));
  };

  // as we need synchronous upload of files to happen in case parent folder matches in bulk upload we are using for of
  // disabled the await as this is an edge case in the rule that should have await
  const addFiles = useCallback(
    async (files: FileWithPreview[], parentId?: string) => {
      try {
        validateFolderDepth(files);
        validateLimit(files);

        // eslint-disable-next-line no-restricted-syntax
        for (const file of files) {
          const fileUploadId = getUploadId(file);
          try {
            const shouldUseVirtualPath = !isFileWithoutFolders(file);

            handleAddUploadFile(file, parentId);

            const fileToUpload =
              getAttachmentTypeFromName(file.type, false) ===
              AttachmentFileType.IMAGE
                ? // eslint-disable-next-line no-await-in-loop
                  await resizeImageToTargetSize(file, IMAGE_SIZE_IN_MB)
                : file;

            const uploadPath = getAttachmentS3Path({
              serviceCompanyId: user!.userAccount.serviceCompany.id,
              entityType,
              entityId,
              name: fileToUpload.name,
            });

            // eslint-disable-next-line no-await-in-loop
            await uploadImages({
              files: [fileToUpload],
              uploadPath,
              useNameAsFullPath: true,
            });

            // eslint-disable-next-line no-await-in-loop
            await addAttachment(
              createFileObject({
                entityType,
                entityId,
                name: shouldUseVirtualPath ? undefined : fileToUpload.name,
                fileType: fileToUpload.type,
                fileSize: fileToUpload.size,
                uri: uploadPath,
                parentId,
                virtualPath: shouldUseVirtualPath
                  ? getVirtualPath(file, fileToUpload)
                  : undefined,
              }),
            );

            handleUpdateUploadStatus(fileUploadId, UploadStatus.COMPLETED);
          } catch (error) {
            handleUpdateUploadStatus(fileUploadId, UploadStatus.ERROR);
          }
        }
      } catch (error) {
        console.error('Error uploading files:', error);
      }
    },
    [entityType, entityId, user, uploadImages, addAttachment],
  );

  const addFolder = (props: Omit<CreateFolderProps, 'isFolder'>) => {
    addAttachment(createFolderObject(props));
  };

  return {
    uploadFiles,
    addFiles,
    addFolder,
    onClearUploadFiles: handleClearUploadFiles,
    validateFolderDepth,
    validateLimit,
  };
};

type ButtonMenuProps = {
  onNewFolder: () => void;
};

export const useAttachmentButtonMenu = ({onNewFolder}: ButtonMenuProps) => {
  const {open} = useDropzoneContext();

  const handleFileUpload = () => {
    open?.();
  };

  const baseMenu: MenuBtnProps[] = useMemo(
    () => [
      {
        label: 'New folder',
        icon: <AddIcon />,
        action: onNewFolder,
      },
      {
        label: 'File upload',
        icon: <UploadFileOutlinedIcon />,
        action: handleFileUpload,
      },
    ],
    [onNewFolder, handleFileUpload],
  );

  return baseMenu;
};

type TableMenuActionProps = ButtonMenuProps & {
  depth: number;
  onMove: () => void;
  onRename: () => void;
  onDelete: () => void;
  onAddFile: () => void;
};

export const useAttachmentTableButtonMenu = ({
  depth,
  onNewFolder,
  onMove,
  onRename,
  onDelete,
  onAddFile,
}: TableMenuActionProps) => {
  const {open} = useDropzoneContext();

  const handleFileUpload = () => {
    onAddFile();
    open?.();
  };

  // for table action cell
  const extendedMenu: MenuAction[] = useMemo(
    () => [
      {
        label: 'New folder',
        icon: <AddIcon />,
        onClick: onNewFolder,
        disabled: depth >= ATTACHMENT_DEPTH_LIMIT,
      },
      {
        label: 'File upload',
        icon: <UploadFileOutlinedIcon />,
        onClick: handleFileUpload,
      },
      {
        label: 'Move',
        icon: <DriveFileMoveOutlinedIcon />,
        onClick: onMove,
      },
      {
        label: 'Rename',
        icon: <EditOutlinedIcon />,
        onClick: onRename,
      },
      {
        label: 'Delete',
        icon: <DeleteOutlineOutlinedIcon />,
        onClick: onDelete,
      },
    ],
    [onNewFolder, handleFileUpload, onRename, onMove, onDelete],
  );

  return extendedMenu;
};

export default useAttachmentActions;
