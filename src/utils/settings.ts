import {MinToStep} from 'models/service-company';
import {t} from 'i18next';

export const generateOptions = () =>
  Array.from({length: 61}, (_, index) => ({
    label: t(`{{number}} day${index !== 1 ? 's' : ''}`, {
      number: index,
    }),
    value: String(index),
  }));

export const generateMinStepOptions = () => [
  {label: t('No rounding'), value: String(MinToStep.STEP_0)},
  {
    label: t('{{number}} minutes', {number: 5}),
    value: String(MinToStep.STEP_5),
  },
  {
    label: t('{{number}} minutes', {number: 15}),
    value: String(MinToStep.STEP_15),
  },
  {
    label: t('{{number}} minutes', {number: 20}),
    value: String(MinToStep.STEP_20),
  },
  {
    label: t('{{number}} minutes', {number: 30}),
    value: String(MinToStep.STEP_30),
  },
  {
    label: t('{{number}} minutes', {number: 60}),
    value: String(MinToStep.STEP_60),
  },
];
