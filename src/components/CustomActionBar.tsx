import React from 'react';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {Button} from './Button';

interface CustomActionBarProps {
  onClear: () => void;
  onAccept: () => void;
}

const CustomActionBar: React.FC<CustomActionBarProps> = ({
  onClear,
  onAccept,
}) => {
  const {t} = useTranslation();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0em 0em 1em 0em',
        margin: '24px 1em 0.5em 1em',
        position: 'relative',
        width: '91%',
      }}>
      <Button buttonProps={{onClick: onClear, size: 'large'}}>
        <Typography variant="subtitle2">{t('Cancel')}</Typography>
      </Button>

      <Button
        buttonProps={{
          size: 'large',
          variant: 'contained',
          onClick: onAccept,
          autoFocus: true,
        }}>
        <Typography variant="subtitle2">{t('Confirm')}</Typography>
      </Button>
    </div>
  );
};

export default CustomActionBar;
