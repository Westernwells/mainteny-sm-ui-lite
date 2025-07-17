import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {QueryClient, QueryClientProvider} from 'react-query';
import {I18nextProvider} from 'react-i18next';
import {SnackbarProvider} from 'notistack';
import Notes from 'components/Notes';
import {
  Comment,
  CommentType,
  CommentStatus,
  CommentCategory,
} from 'models/comment';
import {Role, UserAccountStatus} from 'models/user';
import {State} from 'models/misc';
import {theme} from 'theme';
import {ThemeProvider} from '@mui/material/styles';
import i18n from './config/i18n';

vi.mock('hooks/reactQuery/useUserSession', () => ({
  useUserSession: () => ({
    user: {
      userAccount: {
        id: 'test-user-id',
        firstName: 'Test',
        lastName: 'User',
        photoUrl: null,
        serviceCompany: {
          id: 'test-service-company-id',
          name: 'Test Company',
        },
      },
    },
  }),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({
    ref: vi.fn(),
    inView: true, // Always return true to trigger fetchNextPage
  }),
}));

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>{ui}</SnackbarProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>,
  );

const mockNote: Comment = {
  id: '1',
  refId: 'test-ref-id',
  type: CommentType.INVOICE_COMMENT,
  subject: '',
  content: 'Test note content',
  status: CommentStatus.DEFAULT,
  serviceCompanyId: 'test-service-company-id',
  category: CommentCategory.ALL,
  meta: {
    createdAt: '2023-01-01T00:00:00.000Z',
    lastUpdatedAt: '2023-01-01T00:00:00.000Z',
    state: State.ACTIVE,
    creator: {
      id: 'test-user-id', // Same as user in useUserSession mock
      username: 'john.doe',
      firstName: 'John',
      lastName: 'Doe',
      photoUrl: '',
      contact: {
        email: 'john.doe@example.com',
        phone: '+1234567890',
      },
      category: 'EMPLOYEE',
      title: 'Developer',
      serviceCompanyId: 'test-service-company-id',
      roles: [Role.ADMIN],
      status: UserAccountStatus.NORMAL,
    },
  },
};

const mockNotesData = {
  pages: [{data: [mockNote as any], total: 1}],
  pageParams: [],
};

const mockEmptyNotesData = {
  pages: [{data: [], total: 0}],
  pageParams: [],
};

const defaultProps = {
  notes: mockNotesData,
  isLoading: false,
  isFetchingNextPage: false,
  hasNextPage: false,
  isDeleting: false,
  isUpdating: false,
  isCreating: false,
  fetchNextPage: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
};

describe('Notes Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading and Empty States', () => {
    it('should display skeleton loader when loading', () => {
      renderWithProviders(<Notes {...defaultProps} isLoading />);

      expect(screen.getAllByTestId('note-card-skeleton')).toHaveLength(10);
    });

    it('should display empty state when no notes exist', () => {
      renderWithProviders(
        <Notes {...defaultProps} notes={mockEmptyNotesData} />,
      );

      expect(
        screen.getByText('No notes yet. They will appear here once added.'),
      ).toBeInTheDocument();
    });

    it('should display existing notes', () => {
      renderWithProviders(<Notes {...defaultProps} />);

      expect(screen.getByText('Test note content')).toBeInTheDocument();
    });
  });

  describe('Create Note', () => {
    it('should render note input form', () => {
      renderWithProviders(<Notes {...defaultProps} />);

      expect(screen.getByLabelText('Note message')).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Submit note'}),
      ).toBeInTheDocument();
    });

    it('should disable submit button when input is empty', () => {
      renderWithProviders(<Notes {...defaultProps} />);

      const submitButton = screen.getByRole('button', {name: 'Submit note'});
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when input has content', async () => {
      renderWithProviders(<Notes {...defaultProps} />);

      const input = screen.getByLabelText('Note message');
      const submitButton = screen.getByRole('button', {name: 'Submit note'});

      fireEvent.change(input, {target: {value: 'New note content'}});

      await waitFor(() => {
        expect(submitButton).toBeEnabled();
      });
    });

    it('should call createNote when form is submitted', async () => {
      const mockCreateNote = vi.fn().mockImplementation((vars, options) => {
        options?.onSuccess?.();
        return Promise.resolve();
      });

      renderWithProviders(
        <Notes {...defaultProps} createNote={mockCreateNote} />,
      );

      const input = screen.getByLabelText('Note message');
      const submitButton = screen.getByRole('button', {name: 'Submit note'});

      fireEvent.change(input, {target: {value: 'New note content'}});
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateNote).toHaveBeenCalledWith(
          {
            body: {
              content: 'New note content',
              subject: '',
            },
          },
          expect.any(Object),
        );
      });
    });

    it('should clear input after successful note creation', async () => {
      const mockCreateNote = vi.fn().mockImplementation((vars, options) => {
        options?.onSuccess?.();
        return Promise.resolve();
      });

      renderWithProviders(
        <Notes {...defaultProps} createNote={mockCreateNote} />,
      );

      const input = screen.getByLabelText(
        'Note message',
      ) as HTMLTextAreaElement;

      fireEvent.change(input, {target: {value: 'New note content'}});
      fireEvent.click(screen.getByRole('button', {name: 'Submit note'}));

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should submit note when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const mockCreateNote = vi.fn().mockImplementation((vars, options) => {
        options?.onSuccess?.();
        return Promise.resolve();
      });

      renderWithProviders(
        <Notes {...defaultProps} createNote={mockCreateNote} />,
      );

      const input = screen.getByLabelText('Note message');

      await user.type(input, 'New note content');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockCreateNote).toHaveBeenCalled();
      });
    });

    it('should not submit when Shift+Enter is pressed', async () => {
      const mockCreateNote = vi.fn();

      renderWithProviders(
        <Notes {...defaultProps} createNote={mockCreateNote} />,
      );

      const input = screen.getByLabelText('Note message');

      fireEvent.change(input, {target: {value: 'New note content'}});
      fireEvent.keyPress(input, {key: 'Enter', code: 13, shiftKey: true});

      await waitFor(() => {
        expect(mockCreateNote).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edit Note', () => {
    it('should call updateNote when editing a note', async () => {
      const mockUpdateNote = vi.fn().mockImplementation((vars, options) => {
        options?.onSuccess?.();
        return Promise.resolve();
      });

      renderWithProviders(
        <Notes {...defaultProps} updateNote={mockUpdateNote} />,
      );

      const allButtons = screen.getAllByRole('button');
      const editButton = allButtons.find((button) => {
        const svg = button.querySelector('[data-testid="EditIcon"]');
        return svg !== null;
      });

      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton!);

      await waitFor(() => {
        const input = screen.getByLabelText('Note message');
        expect(input).toHaveValue('Test note content');
      });

      const input = screen.getByLabelText('Note message');
      fireEvent.change(input, {target: {value: 'Updated note content'}});

      const submitButton = screen.getByRole('button', {name: /submit note/i});
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateNote).toHaveBeenCalledWith(
          {
            noteId: '1',
            body: {
              content: 'Updated note content',
              subject: '',
            },
          },
          expect.any(Object),
        );
      });
    });
  });

  describe('Delete Note', () => {
    it('should show delete confirmation modal', async () => {
      renderWithProviders(<Notes {...defaultProps} />);

      const allButtons = screen.getAllByRole('button');
      const deleteButton = allButtons.find((button) => {
        const svg = button.querySelector('[data-testid="DeleteOutlineIcon"]');
        return svg !== null;
      });

      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton!);

      await waitFor(() => {
        expect(
          screen.getByText(
            /You are about to delete a note, are you sure about this/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('should call deleteNote when deletion is confirmed', async () => {
      const mockDeleteNote = vi.fn().mockImplementation((vars, options) => {
        options?.onSuccess?.();
        return Promise.resolve();
      });

      renderWithProviders(
        <Notes {...defaultProps} deleteNote={mockDeleteNote} />,
      );

      const allButtons = screen.getAllByRole('button');
      const deleteButton = allButtons.find((button) => {
        const svg = button.querySelector('[data-testid="DeleteOutlineIcon"]');
        return svg !== null;
      });

      fireEvent.click(deleteButton!);

      const confirmButton = await screen.findByRole('button', {
        name: /confirm|delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteNote).toHaveBeenCalledWith(
          {noteId: '1'},
          expect.any(Object),
        );
      });
    });

    it('should not delete when canceling confirmation', async () => {
      const mockDeleteNote = vi.fn();

      renderWithProviders(
        <Notes {...defaultProps} deleteNote={mockDeleteNote} />,
      );

      const allButtons = screen.getAllByRole('button');
      const deleteButton = allButtons.find((button) => {
        const svg = button.querySelector('[data-testid="DeleteOutlineIcon"]');
        return svg !== null;
      });

      fireEvent.click(deleteButton!);

      const cancelButton = await screen.findByRole('button', {name: /cancel/i});
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByText(
            /You are about to delete a note, are you sure about this/i,
          ),
        ).not.toBeInTheDocument();
      });

      expect(mockDeleteNote).not.toHaveBeenCalled();
    });
  });

  describe('Infinite Scrolling', () => {
    it('should load more notes when scrolling to bottom', async () => {
      const mockFetchNextPage = vi.fn();

      renderWithProviders(
        <Notes
          {...defaultProps}
          hasNextPage
          fetchNextPage={mockFetchNextPage}
        />,
      );

      // Since we mocked useInView to return inView: true and hasNextPage is true,
      // fetchNextPage should be called automatically due to the useEffect in Notes component
      await waitFor(() => {
        expect(mockFetchNextPage).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<Notes {...defaultProps} />);

      expect(screen.getByLabelText('Note message')).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Submit note'}),
      ).toBeInTheDocument();
    });
  });
});
