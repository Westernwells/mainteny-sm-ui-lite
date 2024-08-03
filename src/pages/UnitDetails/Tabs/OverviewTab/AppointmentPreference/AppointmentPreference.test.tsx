import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {SnackbarProvider} from 'notistack';
import {AppointmentPreference} from 'pages/UnitDetails/Tabs/OverviewTab/AppointmentPreference';
import {expect} from 'vitest';
import {QueryClient, QueryClientProvider} from 'react-query';
import {queryErrorHandler, MutationErrorHandler} from 'reactQuery/handlers';
import {act} from 'react-dom/test-utils';
import {mockElevator, mockI18n} from '__tests__/mocks/elevators';
import 'react-i18next';

mockI18n();

describe('Appointment Preference component', () => {
  const setup = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          onError: queryErrorHandler,
        },
        mutations: {
          onError: MutationErrorHandler,
        },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <AppointmentPreference
            elevator={mockElevator!}
            propertyOwnerId={mockElevator?.propertyOwner.id}
          />
        </SnackbarProvider>
      </QueryClientProvider>,
    );
  };

  it('should open dialog on edit button click without crashing', async () => {
    await act(async () => {
      setup();
    });

    const editButton = screen.getByTestId('EditOutlinedIcon');
    expect(editButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(editButton);
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('save button should be enabled if days of week, openingHours, and closingHour have values', async () => {
    await act(async () => {
      setup();
    });

    const editButton = screen.getByTestId('EditOutlinedIcon');
    expect(editButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(editButton);
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Select Days of the Week
    const daysOfWeekSelect = screen.getByLabelText('Days of the week');
    expect(daysOfWeekSelect).toBeInTheDocument();
    fireEvent.mouseDown(daysOfWeekSelect);

    // Wait for the options to appear and select them
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByText('Monday'));
    fireEvent.click(screen.getByText('Tuesday'));
    fireEvent.click(document.body);

    // Interact with the time pickers
    fireEvent.click(screen.getByTestId('opening-hour-start'));

    // Wait for the options to appear and select them
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(6);
    });

    fireEvent.click(screen.getByText('04'));
    fireEvent.click(screen.getByText('30'));
    fireEvent.click(screen.getByText('Confirm'));

    fireEvent.click(screen.getByTestId('opening-hour-end'));

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(43);
    });

    fireEvent.click(screen.getByText('22'));
    fireEvent.click(screen.getByText('40'));

    fireEvent.click(screen.getByText('Confirm'));

    const saveButton = screen.getByTestId('saveButton');

    await waitFor(() => {
      expect(saveButton).toBeInTheDocument();
    });

    expect(saveButton).toHaveAttribute('aria-disabled', 'false');
  });
});
