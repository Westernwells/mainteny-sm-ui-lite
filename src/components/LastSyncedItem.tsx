import {Typography} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import {useTranslation} from 'react-i18next';

interface Props {
  lastSyncedText?: string;
}

const LastSyncedItem = ({lastSyncedText}: Props) => {
  const {t} = useTranslation();
  return (
    <Typography
      color="#8F9BB3"
      sx={{
        alignSelf: 'flex-end',
        p: '0.1em 0em 1em 0em',
        fontSize: '0.9rem',
        alignItems: 'center',
        display: 'flex',
      }}>
      <CheckIcon sx={{m: '0em 0.5em'}} /> {t('Synced with XERO')}{' '}
      {lastSyncedText}
    </Typography>
  );
};

export default LastSyncedItem;
