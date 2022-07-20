import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';

type Props = {
  total: number;
  taken: number;
  left: number;
};

const AbsenceStatistic = ({total, taken, left}: Props) => {
  const {t} = useTranslation();
  return (
    <Box
      sx={{
        background: '#FAFAFA',
        padding: '0.938em 1.875em',
        marginTop: '0.625em',
      }}
      display="flex"
      justifyContent="space-between">
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography sx={{color: 'text.secondary', fontSize: '12px'}}>
          {t('Total')}
        </Typography>
        <Typography
          sx={{
            color: 'text.primary',
            fontWeight: '600',
            fontSize: '16px',
          }}>
          {total}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography sx={{color: 'text.secondary', fontSize: '12px'}}>
          {t('Used')}
        </Typography>
        <Typography
          sx={{
            color: 'text.primary',
            fontWeight: '600',
            fontSize: '16px',
          }}>
          {taken}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography sx={{color: 'text.secondary', fontSize: '12px'}}>
          {t('Left')}
        </Typography>
        <Typography
          sx={{
            color: 'secondary.dark',
            fontWeight: '600',
            fontSize: '16px',
          }}>
          {left}
        </Typography>
      </Box>
    </Box>
  );
};

export default AbsenceStatistic;
