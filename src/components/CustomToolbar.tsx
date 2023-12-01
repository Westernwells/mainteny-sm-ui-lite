import React from 'react';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import {Button} from './Button';

interface Props {
  toolBarTitle: React.ReactNode;
  isDatePicker: boolean;
  onClose: () => void;
}

const CustomToolBar = ({toolBarTitle, onClose, isDatePicker}: Props) => {
  const {t} = useTranslation();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        margin: isDatePicker ? '0em 1em 0em 1.3em' : '0em 1em 0em 1.7em',
        padding: '1em 0em 0em 0em',
        alignItems: 'center',
        position: 'relative',
      }}>
      <Typography variant="subtitle2">{t(`${toolBarTitle}`)}</Typography>

      {isDatePicker && (
        <Button
          buttonProps={{
            onClick: onClose,
            autoFocus: true,
            sx: {minWidth: '10px'},
          }}>
          <CloseIcon />
        </Button>
      )}
    </div>
  );
};

export default CustomToolBar;
