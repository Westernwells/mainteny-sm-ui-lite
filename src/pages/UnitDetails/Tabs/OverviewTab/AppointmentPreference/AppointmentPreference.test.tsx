import {render, screen, fireEvent, within} from '@testing-library/react';
import {SnackbarProvider} from 'notistack';
import {AppointmentPreference} from 'pages/UnitDetails/Tabs/OverviewTab/AppointmentPreference';
import {expect} from 'vitest';
import {QueryClient, QueryClientProvider} from 'react-query';
import {queryErrorHandler, MutationErrorHandler} from 'reactQuery/handlers';
import {act} from 'react';
import {mockElevator, mockI18n} from '__tests__/mocks/elevators';
import 'react-i18next';

mockI18n();

describe('Appointment Preference component', () => {
  let setup: () => void;

  beforeEach(() => {
    setup = () => {
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

      render(
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

    setup();
  });

  const clickEditButton = async () => {
    const editButton = screen.getByTestId('EditOutlinedIcon');
    await act(async () => {
      fireEvent.click(editButton);
    });
  };

  const selectTime = async (
    timePickerTestId: string,
    hour: string,
    minute: string,
  ) => {
    const timePicker = screen.getByTestId(timePickerTestId);
    fireEvent.click(timePicker);

    const timePopup = screen.getByTestId(`${timePickerTestId}-popup`);
    fireEvent.click(within(timePopup).getByText(hour));
    fireEvent.click(within(timePopup).getByText(minute));
    fireEvent.click(within(timePopup).getByText('Confirm'));
  };

  const verifySaveButtonState = (isEnabled: boolean) => {
    const saveButton = screen.getByTestId('saveButton');
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveAttribute(
      'aria-disabled',
      isEnabled ? 'false' : 'true',
    );
  };

  it('should disable save button if closing hour is earlier than or equal to opening hour', async () => {
    await clickEditButton();

    const dialog = screen.getByTestId('appointment-preferences-dialog');
    expect(dialog).toBeInTheDocument();

    await selectTime('opening-hour-start', '14', '35');
    await selectTime('opening-hour-end', '13', '30');

    verifySaveButtonState(false);
    expect(dialog).toHaveTextContent('The end time is before start time.');
  });

  it('should enable save button if times are selected but no days of the week are selected', async () => {
    await clickEditButton();

    const dialog = screen.getByTestId('appointment-preferences-dialog');
    expect(dialog).toBeInTheDocument();

    await selectTime('opening-hour-start', '04', '30');
    await selectTime('opening-hour-end', '22', '40');

    verifySaveButtonState(true);
  });
});
