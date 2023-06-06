import {ContractTypes} from 'models/contract';

export interface ContractNameFormModel {
  contractName: string;
  contractType: ContractTypes | string;
}
