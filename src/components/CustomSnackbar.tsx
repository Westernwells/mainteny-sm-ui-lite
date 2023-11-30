import React from 'react';
import {useTranslation} from 'react-i18next';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

type Props = {
  message: string;
  snackIcon: string;
};

const CustomSnackbar = ({message, snackIcon}: Props) => {
  const {t} = useTranslation();
  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      {snackIcon === 'delete' ? (
        <DeleteIcon style={{marginRight: '8px'}} />
      ) : (
        <CancelIcon style={{marginRight: '8px'}} />
      )}
      <span>{t(message)}</span>
    </div>
  );
};

export default CustomSnackbar;
