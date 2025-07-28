import {Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';

type Props = {
  label: string;
  required?: boolean;
};

const FormInputLabel = ({label, required = false}: Props) => {
  const {t} = useTranslation();

  return (
    <Typography variant="subtitle2">
      {t(label)}
      {required && <span style={{color: '#FC5555'}}>*</span>}
    </Typography>
  );
};

export default FormInputLabel;
