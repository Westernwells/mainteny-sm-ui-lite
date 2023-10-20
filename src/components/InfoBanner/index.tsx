import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';

import {ReactComponent as InfoIcon} from 'assets/icons/Info.svg';
import {Typography} from '@mui/material';

interface Props {
  title: string;
  body: string | string[];
}

export const InfoBanner = ({title, body}: Props) => {
  const {t} = useTranslation();

  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        background: theme.palette.info.outlinedHoverBg,
        padding: '1em',
        marginBottom: '0.5em',
      }}>
      <InfoIcon style={{marginTop: '2px'}} fontSize="1.4em" />
      <Box sx={{marginLeft: '1em'}}>
        <Typography variant="h6">{t(title)}</Typography>
        {Array.isArray(body) ? (
          body.map((item, index) => (
            <Typography key={index} variant="body2">
              {t(item)}
            </Typography>
          ))
        ) : (
          <Typography variant="body2">{t(body)}</Typography>
        )}
      </Box>
    </Box>
  );
};
