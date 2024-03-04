import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {ContractView} from 'models/contract';
import {useTranslation} from 'react-i18next';
import {useFormatDate} from 'hooks/useFormatDate';
import React from 'react';

interface Props {
  contractDetails?: ContractView;
  unUsedContractDays: number | false;
}

export const ContractTimeline = ({
  contractDetails,
  unUsedContractDays,
}: Props) => {
  const {t} = useTranslation();
  const formatDate = useFormatDate();
  const theme = useTheme();

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            mr: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '.75rem',
            height: '.75rem',
            borderRadius: '50%',
            border: `2px solid ${
              unUsedContractDays
                ? theme.palette.success.main
                : theme.palette.text.secondary
            }`,
          }}
        />
        <Box>
          <Typography variant="subtitle1">
            <span style={{fontWeight: 'bold'}}>{t('Contract')}</span>{' '}
            {t('ends')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
            }}>
            {formatDate(contractDetails?.end)} {' | '}
            {formatDate(contractDetails?.endTime, 'HH:mm')}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          height: '2.25rem',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '0.125em',
          marginLeft: '.375rem',
          transform: 'translateX(-50%)',
          position: 'relative',
          backgroundColor: theme.palette.text.secondary,
        }}
      />
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            border: `2px solid ${
              unUsedContractDays
                ? theme.palette.success.main
                : theme.palette.text.secondary
            }`,
            mr: '1em',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '.75rem',
            height: '.75rem',
            borderRadius: '50%',
          }}
        />
        <Box>
          <Typography variant="subtitle1">
            <span style={{fontWeight: 'bold'}}>{t('Contract')}</span>{' '}
            {t('signed')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
            }}>
            {formatDate(contractDetails?.start)} {' | '}
            {formatDate(contractDetails?.startTime, 'HH:mm')}
          </Typography>
        </Box>
      </Box>
    </>
  );
};
