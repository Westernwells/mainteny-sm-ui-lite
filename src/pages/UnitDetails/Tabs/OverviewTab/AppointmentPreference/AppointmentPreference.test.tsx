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

  it('should show error if times are selected but no days of the week are selected', async () => {
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

    // Verify Error Message for Missing Days of the Week
    const errorMessage = await screen.findByText(
      'Select at least one day of the week.',
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it('should show error if all days are deselected after times are set', async () => {
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

    // Deselect All Days of the Week

    fireEvent.mouseDown(daysOfWeekSelect);

    fireEvent.click(within(daysOfWeekList).getByText('Monday'));
    fireEvent.click(within(daysOfWeekList).getByText('Tuesday'));
    fireEvent.click(document.body);

    // Verify Error Message for Deselecting All Days
    const errorMessage = await screen.findByText(
      'Select at least one day of the week.',
    );
    expect(errorMessage).toBeInTheDocument();
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
});
