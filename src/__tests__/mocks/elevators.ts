import {
  ContractServiceFormElevator,
  ContractTimeUnit,
} from '../../models/contract';

const elevatorOne: ContractServiceFormElevator = {
  elevatorId: '369ea946-df3b-47b8-a3b9-eddfdbfb805e',
  invoiceJob: {
    timeUnit: ContractTimeUnit.NONE,
    timeNumbers: [],
  },
  orderGenerationJob: {
    timeUnit: ContractTimeUnit.TRIWEEKLY,
    timeNumbers: [],
  },
  price: 1000,
  externalId: 'UNIT00000091',
  address: 'Kehinde Owolabi Street 33, 102213, Lagos, Lagos, Nigeria',
  buildingLocation: '-',
  isChecked: true,
};

const elevatorTwo: ContractServiceFormElevator = {
  elevatorId: '4696ec59-93a1-4228-8ad3-cf5ccdd18982',
  invoiceJob: {
    timeUnit: ContractTimeUnit.NONE,
    timeNumbers: [],
  },
  orderGenerationJob: {
    timeUnit: ContractTimeUnit.MONTHLY,
    timeNumbers: [2, 5],
  },
  price: 1500,
  externalId: 'UNIT00000076',
  address: '10178, Berlin, Berlin, Germany',
  buildingLocation: '-',
  isChecked: true,
};

export const SERVICE_ELEVATORS: ContractServiceFormElevator[] = [
  elevatorOne,
  elevatorTwo,
];
