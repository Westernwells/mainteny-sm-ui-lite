import {render, screen} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {SnackbarProvider} from 'notistack';
import {beforeEach, expect, it, describe} from 'vitest';
import {act} from 'react-dom/test-utils';
import {MemoryRouter} from 'react-router-dom';
import ContractServices from './index';
import {ElevatorView} from '../../../../../models/elevator';
import {ContractSimpleView} from '../../../../../models/contract';
import {
  mockElevator,
  mockValidElevatorContracts,
  mockI18n,
  mockElevatorContracts,
} from '../../../../../__tests__/mocks/elevators';

mockI18n();

const queryClient = new QueryClient();

describe('Contract Services', () => {
  const data: ElevatorView = {
    ...mockElevator,
    contracts: mockElevatorContracts as ContractSimpleView[],
  };

  beforeEach(async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SnackbarProvider>
              <ContractServices elevator={data} />
            </SnackbarProvider>
          </QueryClientProvider>
        </MemoryRouter>,
      );
    });
  });

  it('should display the contract that includes the given elevator', () => {
    expect(
      screen.getByText(mockValidElevatorContracts.components![0].name),
    ).toBeInTheDocument();
  });

  it('should not display the contract that does not include the given elevator', () => {
    expect(
      screen.queryByText(mockValidElevatorContracts.components![1].name),
    ).not.toBeInTheDocument();
  });
});
