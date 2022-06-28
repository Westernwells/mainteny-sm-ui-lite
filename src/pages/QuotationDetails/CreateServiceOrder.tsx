import {FormSelect} from 'components/form/FormSelect';
import {ServiceOrderType} from 'models/service-order';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import {convertToText} from 'utils/utils';

interface Props {
  value: string;
  onChange: (e: any) => void;
}

export const CreateServiceOrder = ({value, onChange}: Props) => (
  <FormSelect
    labelId="createServiceOrder-label"
    label="Service Order Type"
    options={Object.keys(ServiceOrderType).map((i) => ({
      label: serviceOrderTypeToString(i as ServiceOrderType),
      value: convertToText(i),
    }))}
    selectProps={{
      id: 'createServiceOrder',
      value,
      onChange,
      name: 'createServiceOrder',
    }}
  />
);
