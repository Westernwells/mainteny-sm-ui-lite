import {screen, within} from '@testing-library/react';

export const attachmentTableUtils = {
  findFolderExpandButton: async (folderName: string): Promise<HTMLElement> => {
    const folderTextElement = await screen.findByText(folderName);

    const tableCell = folderTextElement.closest('td[role="cell"]');
    if (!tableCell) {
      throw new Error(`Could not find table cell for folder: ${folderName}`);
    }

    const expandButton = within(tableCell as HTMLElement).getByRole('button');
    if (!expandButton) {
      throw new Error(`Could not find expand button for folder: ${folderName}`);
    }

    return expandButton;
  },

  queryFolderExpandButton: (folderName: string): HTMLElement | null => {
    const folderTextElement = screen.queryByText(folderName);

    if (!folderTextElement) return null;

    const tableCell = folderTextElement.closest('td[role="cell"]');

    if (!tableCell) return null;

    return within(tableCell as HTMLElement).queryByRole('button');
  },

  isFolderExpanded: (folderName: string): boolean => {
    const expandButton =
      attachmentTableUtils.queryFolderExpandButton(folderName);
    if (!expandButton) return false;

    const arrowIcon = expandButton.querySelector(
      'svg[data-testid="ArrowDropDownIcon"]',
    );

    return !!arrowIcon;
  },

  findFileByName: (fileName: string): HTMLElement | null =>
    screen.queryByText(
      (content, element) =>
        content.includes(fileName) ||
        element?.textContent?.includes(fileName) ||
        false,
    ),
};
