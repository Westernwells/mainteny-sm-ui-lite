import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {Link as RouterLink} from 'react-router-dom';
import {Link} from '@mui/material';
import {useTranslation} from 'react-i18next';

export const SeeMore = ({path}: {path: string}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  return (
    <Box display="flex" justifyContent="center" alignItems="center" pb="1rem">
      <Link
        component={RouterLink}
        to={path}
        underline="hover"
        variant="caption"
        color={theme.palette.info.main}>
        {t('See more')}
      </Link>
    </Box>
  );
};
