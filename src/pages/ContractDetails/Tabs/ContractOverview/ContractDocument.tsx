import React from 'react';
import {Box, Typography} from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const ContractDocument = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingY: 2,
        paddingX: 4,
        borderRadius: '4px',
        border: '1px solid #8F9BB380',
      }}>
      <FileCopyIcon htmlColor="rgba(15, 76, 100, 0.5)" fontSize="large" />
      <Typography
        sx={{
          color: '#8F9BB3',
          marginTop: 0.625,
        }}
        variant="subtitle2">
        File.pdf
      </Typography>
    </Box>
    <Typography
      sx={{
        color: '#8F9BB3',
        marginTop: 1,
        textAlign: 'center',
      }}
      variant="subtitle2">
      Signed Contract <br /> 01.03.2022
    </Typography>
  </Box>
);

export default ContractDocument;
