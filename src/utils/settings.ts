import {MinToStep} from 'models/service-company';

export const generateOptions = () =>
  Array.from({length: 61}, (_, index) => ({
    label: `${index} day${index !== 1 ? 's' : ''}`,
    value: String(index),
  }));

export const generateMinStepOptions = () => [
  {label: 'No rounding', value: String(MinToStep.STEP_0)},
  {label: '5 minutes', value: String(MinToStep.STEP_5)},
  {label: '15 minutes', value: String(MinToStep.STEP_15)},
  {label: '20 minutes', value: String(MinToStep.STEP_20)},
  {label: '30 minutes', value: String(MinToStep.STEP_30)},
  {label: '60 minutes', value: String(MinToStep.STEP_60)},
];
