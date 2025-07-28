import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {ATTACHMENT_LIMIT, AttachmentEntityType} from 'models/attachment';
import {createMockFile} from '__tests__/utils/AttachmentValidation';
import {FileWithPreview} from 'models/files';
import useAttachmentActions from '../../hooks/useAttachmentActions';

const mockEnqueueSnackbar = vi.fn();
const mockT = vi.fn((key: string, options?: any) => {
  if (key.includes('exceeds maximum folder depth')) {
    return `File "${options?.fileName}" exceeds maximum folder depth of ${options?.maxDepth} levels`;
  }
  if (key.includes('Attachment limit')) {
    return `Attachment limit of ${options?.limit} files reached`;
  }
  return key;
});
const mockAddAttachment = vi.fn();
const mockUploadImages = vi.fn();

vi.mock('hooks/reactQuery/useAttachment', () => ({
  useCreateAttachment: () => ({
    mutateAsync: mockAddAttachment,
  }),
}));

vi.mock('hooks/reactQuery/useUploadSignedUrl', () => ({
  useUploadFiles: () => ({
    mutateAsync: mockUploadImages,
  }),
}));

vi.mock('hooks/reactQuery/useUserSession', () => ({
  useUserSession: () => ({
    user: {
      userAccount: {
        serviceCompany: {
          id: 'test-company-id',
        },
      },
    },
  }),
}));

vi.mock('hooks/useSnackbar', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

vi.mock('context/DropzoneProvider', () => ({
  useDropzoneContext: () => ({
    open: vi.fn(),
  }),
}));

vi.mock('utils/attachment', () => ({
  getUploadId: vi.fn((file) => `upload-${file.name}`),
  createFileObject: vi.fn(() => ({id: 'mock-file-object'})),
  createFolderObject: vi.fn(() => ({id: 'mock-folder-object'})),
  getAttachmentS3Path: vi.fn(() => 'mock-s3-path'),
  getAttachmentTypeFromName: vi.fn(() => 'DOCUMENT'),
}));

vi.mock('utils/image-compression', () => ({
  resizeImageToTargetSize: vi.fn((file) => Promise.resolve(file)),
}));

vi.mock('utils/file', () => ({
  getVirtualPath: vi.fn(() => 'mock-virtual-path'),
  isFileWithoutFolders: vi.fn(() => true),
}));

vi.mock('utils/constants', () => ({
  IMAGE_SIZE_IN_MB: 2,
}));

describe('useAttachmentActions - Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Folder Depth Validation', () => {
    it('should show error and stop processing when folder depth exceeds limit', async () => {
      const {result} = renderHook(() =>
        useAttachmentActions(AttachmentEntityType.TASK, 'test-id', 5),
      );

      const deepPath = 'a/b/c/d/e/f/g/file.txt'; // 7 levels deep
      const files = [createMockFile('file.txt', deepPath, deepPath)];

      await act(() => result.current.addFiles(files));

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('exceeds maximum folder depth'),
        {variant: 'error'},
      );

      expect(mockUploadImages).not.toHaveBeenCalled();
      expect(mockAddAttachment).not.toHaveBeenCalled();
    });

    it('should proceed normally when folder depth is within limit', async () => {
      const {result} = renderHook(() =>
        useAttachmentActions(AttachmentEntityType.TASK, 'test-id', 5),
      );

      const files = [
        createMockFile('file.txt', 'folder/file.txt', 'folder/file.txt'),
      ];

      await act(() => result.current.addFiles(files));

      expect(mockEnqueueSnackbar).not.toHaveBeenCalledWith(
        expect.stringContaining('exceeds maximum folder depth'),
        expect.any(Object),
      );

      expect(mockUploadImages).toHaveBeenCalled();
      expect(mockAddAttachment).toHaveBeenCalled();
    });

    it('should not show error when folder depth equals the limit (boundary case)', async () => {
      const {result} = renderHook(() =>
        useAttachmentActions(AttachmentEntityType.TASK, 'test-id', 5),
      );

      const exactLimitPath = 'a/b/c/file.txt';
      const files = [
        createMockFile('file.txt', exactLimitPath, exactLimitPath),
      ];

      await act(() => result.current.addFiles(files));

      expect(mockEnqueueSnackbar).not.toHaveBeenCalled();

      expect(mockUploadImages).toHaveBeenCalled();
      expect(mockAddAttachment).toHaveBeenCalled();
    });
  });

  describe('Attachment Limit Validation', () => {
    it('should show error and stop processing when attachment limit is exceeded', async () => {
      // Set totalAttachments close to limit
      const currentAttachments = ATTACHMENT_LIMIT - 1;
      const {result} = renderHook(() =>
        useAttachmentActions(
          AttachmentEntityType.TASK,
          'test-id',
          currentAttachments,
        ),
      );

      const files = [
        createMockFile('file1.txt'),
        createMockFile('file2.txt'),
        createMockFile('file3.txt'),
      ];

      await act(() => result.current.addFiles(files));

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Attachment limit'),
        {variant: 'error'},
      );

      expect(mockUploadImages).not.toHaveBeenCalled();
      expect(mockAddAttachment).not.toHaveBeenCalled();
    });

    it('should proceed normally when attachment limit is not exceeded', async () => {
      const {result} = renderHook(() =>
        useAttachmentActions(AttachmentEntityType.TASK, 'test-id', 5),
      );

      const files = [createMockFile('file1.txt')];

      await act(() => result.current.addFiles(files));
      expect(mockEnqueueSnackbar).not.toHaveBeenCalledWith(
        expect.stringContaining('Attachment limit'),
        expect.any(Object),
      );

      expect(mockUploadImages).toHaveBeenCalled();
      expect(mockAddAttachment).toHaveBeenCalled();
    });

    it('should not show error when current + new files equals the limit (boundary case)', async () => {
      // Set current attachments so that current + new = ATTACHMENT_LIMIT exactly
      const currentAttachments = ATTACHMENT_LIMIT - 2; // 248 if limit is 250
      const {result} = renderHook(() =>
        useAttachmentActions(
          AttachmentEntityType.TASK,
          'test-id',
          currentAttachments,
        ),
      );

      // Add exactly 2 files to reach the limit
      const files = [createMockFile('file1.txt'), createMockFile('file2.txt')];

      await act(() => result.current.addFiles(files));

      expect(mockEnqueueSnackbar).not.toHaveBeenCalled();

      expect(mockUploadImages).toHaveBeenCalled();
      expect(mockAddAttachment).toHaveBeenCalled();
    });
  });

  describe('Validation Function Access', () => {
    it('should expose validation functions from hook', () => {
      const {result} = renderHook(() =>
        useAttachmentActions(AttachmentEntityType.TASK, 'test-id', 5),
      );

      expect(typeof result.current.validateFolderDepth).toBe('function');
      expect(typeof result.current.validateLimit).toBe('function');
    });

    it('should validate folder depth correctly when called directly', () => {
      const {result} = renderHook(() =>
        useAttachmentActions(AttachmentEntityType.TASK, 'test-id', 5),
      );

      const deepPath = 'a/b/c/d/e/f/g/file.txt'; // Exceeds limit
      const files = [createMockFile('file.txt', deepPath, deepPath)];

      expect(() => {
        result.current.validateFolderDepth(files);
      }).toThrow('Folder depth exceeded');

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('exceeds maximum folder depth'),
        {variant: 'error'},
      );
    });

    it('should validate limit correctly when called directly', () => {
      const currentAttachments = ATTACHMENT_LIMIT - 1;
      const {result} = renderHook(() =>
        useAttachmentActions(
          AttachmentEntityType.TASK,
          'test-id',
          currentAttachments,
        ),
      );

      const files = [
        createMockFile('file1.txt'),
        createMockFile('file2.txt'),
        createMockFile('file3.txt'),
      ];

      expect(() => {
        result.current.validateLimit(files);
      }).toThrow('Attachment limit exceeded');

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Attachment limit'),
        {variant: 'error'},
      );
    });
  });

  describe('Combined Validation Flow', () => {
    it('should validate folder depth', async () => {
      const {result} = renderHook(() =>
        useAttachmentActions(AttachmentEntityType.TASK, 'test-id', 5),
      );

      const deepPath = 'a/b/c/d/e/f/g/file.txt';
      const files = Array.from({length: ATTACHMENT_LIMIT}, (_, i) =>
        createMockFile(`file${i}.txt`, deepPath, deepPath),
      );

      await act(() => result.current.addFiles(files));

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('exceeds maximum folder depth'),
        {variant: 'error'},
      );

      expect(mockUploadImages).not.toHaveBeenCalled();
      expect(mockAddAttachment).not.toHaveBeenCalled();
    });

    it('should validate items limit if folder depth passes', async () => {
      const {result} = renderHook(() =>
        useAttachmentActions(AttachmentEntityType.TASK, 'test-id', 5),
      );

      const deepPath = 'a/b/file.txt';
      const files = Array.from({length: ATTACHMENT_LIMIT}, (_, i) =>
        createMockFile(`file${i}.txt`, deepPath, deepPath),
      );

      await act(() => result.current.addFiles(files));

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Attachment limit'),
        {variant: 'error'},
      );

      expect(mockUploadImages).not.toHaveBeenCalled();
      expect(mockAddAttachment).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array gracefully', async () => {
      const {result} = renderHook(() =>
        useAttachmentActions(AttachmentEntityType.TASK, 'test-id', 5),
      );

      const files: FileWithPreview[] = [];

      await act(() => result.current.addFiles(files));

      // Should not show any error messages
      expect(mockEnqueueSnackbar).not.toHaveBeenCalled();

      // Should not attempt to upload anything
      expect(mockUploadImages).not.toHaveBeenCalled();
      expect(mockAddAttachment).not.toHaveBeenCalled();
    });
  });
});
