import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ReactComponent as NoSearchResultsIcon} from 'assets/icons/NoResultsSearch.svg';
import {useTheme} from '@mui/material';

const NoMatchTable = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="1em"
      mt={3}>
      <Box width="60px" sx={{textAlign: 'center', color: '#828DA3'}}>
        <NoSearchResultsIcon style={{width: '100%', height: '100%'}} />
      </Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="h5" textAlign="center">
          {t('No matching search results')}
        </Typography>
        <Typography
          variant="subtitle2"
          textAlign="center"
          sx={{color: theme.palette.secondary.mainLight}}>
          {t('Please try again')}
        </Typography>
      </Box>
    </Box>
  );
};

export default NoMatchTable;
