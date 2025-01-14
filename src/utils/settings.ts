import {t} from 'i18next';
import {MinToStep} from 'models/service-company';
import {Settings} from 'models/misc';

export const generateOptions = () =>
  Array.from({length: 61}, (_, index) => ({
    label: t(`{{number}} day${index > 1 ? 's' : ''}`, {
      number: index,
    }),
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

export const getRepresentationText = (
  translate: (key: string) => string,
  settings?: Settings,
) => {
  if (settings?.owner) {
    return `${translate('Owner')}: ${settings.owner}`;
  }
  if (settings?.managingDirector) {
    return `${translate('Managing Director')}: ${settings.managingDirector}`;
  }
  return null;
};
