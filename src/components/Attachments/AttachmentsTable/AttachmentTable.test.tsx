import {beforeEach, describe, expect, it, vi} from 'vitest';
import {screen} from '@testing-library/react';
import {
  attachmentEntityId,
  attachmentEntityType,
  groupAttachments,
} from '__tests__/mocks/attachments';
import AttachmentTable from 'components/Attachments/AttachmentsTable';
import {
  renderWithProvidersAsync,
  waitForStateUpdates,
} from '__tests__/config/providers';
import {createAttachmentsTree} from 'utils/attachment';
import userEvent from '@testing-library/user-event';
import {attachmentTableUtils} from '__tests__/utils/AttachmentTable';

let tree = createAttachmentsTree(groupAttachments);

describe('<AttachmentTable /> – Attachment table tree', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    vi.clearAllMocks();

    user = userEvent.setup();

    tree = createAttachmentsTree(groupAttachments);

    await renderWithProvidersAsync(
      <AttachmentTable
        files={groupAttachments}
        tree={tree.children}
        isCreatingNewRootFolder={false}
        search=""
        entityId={attachmentEntityId}
        entityType={attachmentEntityType}
        onPreview={vi.fn()}
        setIsCreatingNewRootFolder={vi.fn()}
        setFileUploadParentId={vi.fn()}
      />,
    );

    await waitForStateUpdates();
  });

  it('should render folder without expanding by default', async () => {
    const folderAttachmentFound = await screen.findByText('Bulk upload test');
    expect(folderAttachmentFound).toBeInTheDocument();

    expect(attachmentTableUtils.isFolderExpanded('Bulk upload test')).toBe(
      false,
    );

    const subFileAttachment = attachmentTableUtils.findFileByName(
      'Unassigned_250623.pdf',
    );
    expect(subFileAttachment).not.toBeInTheDocument();
  });

  it('should expand folder and show sub-files when clicked', async () => {
    const expandButton = await attachmentTableUtils.findFolderExpandButton(
      'Bulk upload test',
    );

    await user.click(expandButton);

    await waitForStateUpdates();

    const subFileAttachment = await screen.findByText('Unassigned_250623.pdf');

    expect(subFileAttachment).toBeInTheDocument();

    expect(attachmentTableUtils.isFolderExpanded('Bulk upload test')).toBe(
      true,
    );
  });

  it('should handle folder collapse', async () => {
    const expandButton = await attachmentTableUtils.findFolderExpandButton(
      'Bulk upload test',
    );

    await user.click(expandButton);

    await waitForStateUpdates();

    const subFileAttachment = await screen.findByText('Unassigned_250623.pdf');
    expect(subFileAttachment).toBeInTheDocument();
    expect(attachmentTableUtils.isFolderExpanded('Bulk upload test')).toBe(
      true,
    );

    await user.click(expandButton);

    await waitForStateUpdates();

    expect(attachmentTableUtils.isFolderExpanded('Bulk upload test')).toBe(
      false,
    );

    const searchSubFileAttachment = screen.queryByText('Unassigned_250623.pdf');
    expect(searchSubFileAttachment).toBeNull();
  });
});
