import {FormInput} from 'components/form/FormInput';
import {TextFieldProps} from '@mui/material';

type Props = {
  item: TextFieldProps;
};

const FormInputWrapper = ({item}: Props) => (
  <FormInput
    data-testid={`edit-user-account-form-${item.id}`}
    fieldProps={{
      ...item,
    }}
  />
);

export default FormInputWrapper;
