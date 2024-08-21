import {render, screen} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {SnackbarProvider} from 'notistack';
import {beforeEach, expect} from 'vitest';
import {act} from 'react-dom/test-utils';
import {
  mockElevator,
  mockElevatorContracts,
  mockI18n,
  mockValidElevatorContracts,
} from '../../../../../__tests__/mocks/elevators';
import ContractServices from './index';
import {ElevatorView} from '../../../../../models/elevator';
import {ContractSimpleView} from '../../../../../models/contract';

mockI18n();

const queryClient = new QueryClient();

describe('Contract Services should:', () => {
  beforeEach(async () => {
    await act(async () => {
      const data: ElevatorView = {
        ...mockElevator,
        contracts: mockElevatorContracts as unknown as ContractSimpleView[],
      };

      render(
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <ContractServices elevator={data} />
          </SnackbarProvider>
        </QueryClientProvider>,
      );
    });
  });

  it('display active contracts for the given unit', () => {
    expect(
      screen.getByText(mockValidElevatorContracts.components[0].name),
    ).toBeInTheDocument();
  });

  it('not display active contracts when they do not include the unit', async () => {
    expect(
      screen.getByText(mockValidElevatorContracts.components[1].name),
    ).not.toBeInTheDocument();
  });
});
