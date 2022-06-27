import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {formatDate} from 'utils/datetime';
import {ContractView} from 'models/contract';

interface Props {
  contractDetails?: ContractView;
  unUsedContractDays: number | false;
}

export const ContractTimeline = ({
  contractDetails,
  unUsedContractDays,
}: Props) => {
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
            backgroundColor: unUsedContractDays
              ? theme.palette.text.secondary
              : '#00D68F',
          }}
        />
        <Box>
          <Typography variant="subtitle1">Contract ends</Typography>
          <Typography variant="body1">
            {formatDate(contractDetails?.endTime, 'dd MMM YYY')}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          height: '2.25rem',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '2px',
          marginLeft: '.375rem',
          transform: 'translateX(-50%)',
          position: 'relative',
          backgroundColor: theme.palette.text.secondary,
        }}
      />
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            backgroundColor: unUsedContractDays
              ? `#00D68F`
              : theme.palette.text.secondary,
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
          <Typography variant="subtitle1">Contract signed</Typography>
          <Typography variant="body1">
            {formatDate(contractDetails?.startTime, 'dd MMM YYY')}
          </Typography>
        </Box>
      </Box>
    </>
  );
};
