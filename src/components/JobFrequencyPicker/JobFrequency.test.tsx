import {beforeEach, describe, expect, it} from 'vitest';
import {fireEvent, render, screen, within} from '@testing-library/react';
import {noop} from 'lodash';
import {I18nextProvider} from 'react-i18next';
import {QueryClient, QueryClientProvider} from 'react-query';
import mockNotistack from '../../__tests__/config/notistack';
import JobFrequencyPicker from './JobFrequencyPicker';
import {SERVICE_ELEVATORS} from '../../__tests__/mocks/elevators';
import i18n from '../../__tests__/config/i18n';

const queryClient = new QueryClient();

mockNotistack();

describe('When using the JobFrequency component', () => {
  describe('With given values', () => {
    beforeEach(() => {
      const testingValue = SERVICE_ELEVATORS[0];
      render(
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <JobFrequencyPicker
              componentId={testingValue.elevatorId}
              units={SERVICE_ELEVATORS}
              onChange={noop}
            />
          </QueryClientProvider>
        </I18nextProvider>,
      );
    });

    it('it inits the component', () => {
      expect(screen.getByTestId('job-frequency-root')).toBeInTheDocument();
    });

    it('it should show the display value', () => {
      expect(screen.getByText('Every 3 weeks')).toBeInTheDocument();
    });

    it('it should open a dropdown when clicking on the component', async () => {
      fireEvent.click(screen.getByText('Every 3 weeks'));

      await screen.findByText('Fixed cycle');

      expect(screen.getByText('Fixed cycle')).toBeInTheDocument();
      expect(screen.getByText('Pick your month(s)')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('it should open a dropdown when clicking on the component', async () => {
      fireEvent.click(screen.getByText('Every 3 weeks'));

      await screen.findByText('Fixed cycle');

      expect(screen.getByText('Fixed cycle')).toBeInTheDocument();
      expect(screen.getByText('Pick your month(s)')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
  });

  describe('On the open dropdown, should be able', () => {
    beforeEach(async () => {
      const testingValue = SERVICE_ELEVATORS[0];
      render(
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <JobFrequencyPicker
              componentId={testingValue.elevatorId}
              units={SERVICE_ELEVATORS}
              onChange={noop}
            />
          </QueryClientProvider>
        </I18nextProvider>,
      );

      fireEvent.click(screen.getByText('Every 3 weeks'));
      await screen.findByText('Fixed cycle');
    });

    it('To change values', async () => {
      const optionElement = screen.getByText('Pick your month(s)');
      fireEvent.click(optionElement);

      expect(
        within(screen.getByTestId('radio-button-for-by_months')).getByTestId(
          'RadioButtonCheckedIcon',
        ),
      ).toBeInTheDocument();
    });

    it('changing values should disable other options', () => {
      fireEvent.click(screen.getByText('Pick your month(s)'));

      expect(
        within(screen.getByTestId('radio-button-for-fixed')).getByTestId(
          'RadioButtonUncheckedIcon',
        ),
      ).toBeInTheDocument();
    });
  });
});
