import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
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

  it('should disable save button if closing hour is earlier than or equal to opening hour', async () => {
    await act(async () => {
      setup();
    });

    const editButton = screen.getByTestId('EditOutlinedIcon');
    await act(async () => {
      fireEvent.click(editButton);
    });

    const dialog = screen.getByTestId('appointment-preferences-dialog');
    expect(dialog).toBeInTheDocument();

    const openingHourPicker = screen.getByTestId('opening-hour-start');
    fireEvent.click(openingHourPicker);

    const openingHourPopup = screen.getByTestId('opening-hour-popup');

    fireEvent.click(within(openingHourPopup).getByText('14'));
    fireEvent.click(within(openingHourPopup).getByText('35'));
    fireEvent.click(within(openingHourPopup).getByText('Confirm'));

    const closingHourPicker = screen.getByTestId('opening-hour-end');
    fireEvent.click(closingHourPicker);

    const closingHourPopup = screen.getByTestId('closing-hour-popup');

    fireEvent.click(within(closingHourPopup).getByText('13'));
    fireEvent.click(within(closingHourPopup).getByText('30'));
    fireEvent.click(within(closingHourPopup).getByText('Confirm'));

    const saveButton = screen.getByTestId('saveButton');

    expect(saveButton).toHaveAttribute('aria-disabled', 'true');
    expect(dialog).toHaveTextContent(
      'Closing time must be later than opening time.',
    );
  });

  it('should enable save button if times are selected but no days of the week are selected', async () => {
    await act(async () => {
      setup();
    });

    const editButton = screen.getByTestId('EditOutlinedIcon');
    await act(async () => {
      fireEvent.click(editButton);
    });

    const dialog = screen.getByTestId('appointment-preferences-dialog');
    expect(dialog).toBeInTheDocument();

    // Select Opening Hour
    const openingHourPicker = screen.getByTestId('opening-hour-start');
    fireEvent.click(openingHourPicker);

    const openingHourPopup = screen.getByTestId('opening-hour-popup');
    await waitFor(() => {
      const openingHourOptions =
        within(openingHourPopup).getAllByRole('option');
      expect(openingHourOptions.length).toBeGreaterThan(0);
    });

    fireEvent.click(within(openingHourPopup).getByText('04'));
    fireEvent.click(within(openingHourPopup).getByText('30'));
    fireEvent.click(screen.getByText('Confirm'));

    // Select Closing Hour
    const closingHourPicker = screen.getByTestId('opening-hour-end');
    fireEvent.click(closingHourPicker);

    const closingHourPopup = screen.getByTestId('closing-hour-popup');
    await waitFor(() => {
      const closingHourOptions =
        within(closingHourPopup).getAllByRole('option');
      expect(closingHourOptions.length).toBeGreaterThan(0);
    });

    fireEvent.click(within(closingHourPopup).getByText('22'));
    fireEvent.click(within(closingHourPopup).getByText('40'));
    fireEvent.click(screen.getByText('Confirm'));

    // Verify Save Button is Enabled
    const saveButton = screen.getByTestId('saveButton');

    await waitFor(() => {
      expect(saveButton).toBeInTheDocument();
    });

    expect(saveButton).toHaveAttribute('aria-disabled', 'false');
  });

  it('save button should be enabled if days of week, openingHour, and closingHour have values', async () => {
    await act(async () => {
      setup();
    });

    const editButton = screen.getByTestId('EditOutlinedIcon');
    await act(async () => {
      fireEvent.click(editButton);
    });

    const dialog = screen.getByTestId('appointment-preferences-dialog');
    expect(dialog).toBeInTheDocument();

    // Select Days of the Week
    const daysOfWeekSelect = screen.getByLabelText('Days of the week');
    fireEvent.mouseDown(daysOfWeekSelect);

    const daysOfWeekList = screen.getByRole('listbox');

    fireEvent.click(within(daysOfWeekList).getByText('Monday'));
    fireEvent.click(within(daysOfWeekList).getByText('Tuesday'));
    fireEvent.click(document.body);

    // Select Opening Hour
    const openingHourPicker = screen.getByTestId('opening-hour-start');
    fireEvent.click(openingHourPicker);

    const openingHourPopup = screen.getByTestId('opening-hour-popup');

    fireEvent.click(within(openingHourPopup).getByText('04'));
    fireEvent.click(within(openingHourPopup).getByText('30'));
    fireEvent.click(within(openingHourPopup).getByText('Confirm'));

    // Select Closing Hour
    const closingHourPicker = screen.getByTestId('opening-hour-end');
    fireEvent.click(closingHourPicker);

    const closingHourPopup = screen.getByTestId('closing-hour-popup');

    fireEvent.click(within(closingHourPopup).getByText('22'));
    fireEvent.click(within(closingHourPopup).getByText('40'));
    fireEvent.click(within(closingHourPopup).getByText('Confirm'));

    // Verify Save Button is Enabled
    const saveButton = screen.getByTestId('saveButton');

    await waitFor(() => {
      expect(saveButton).toBeInTheDocument();
    });

    expect(saveButton).toHaveAttribute('aria-disabled', 'false');
  });
});
