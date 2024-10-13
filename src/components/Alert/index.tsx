import {Box, Theme, Typography} from '@mui/material';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {SxProps} from '@mui/system';

type Props = {
  Icon: ReactNode;
  textKey: string;
  sx?: SxProps<Theme>;
};

const Alert = ({Icon, textKey, sx}: Props) => {
  const {t} = useTranslation();
  return (
    <Box
      sx={{
        ...sx,
        width: '100%',
        alignItems: 'center',
        display: 'flex',
        padding: '14px 16px',
        borderRadius: '4px',
      }}
      gap={1.5}>
      {Icon}
      <Typography>{t(textKey)}</Typography>
    </Box>
  );
};

export default Alert;
