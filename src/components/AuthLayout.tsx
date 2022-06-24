import React, {useEffect, useState} from 'react';
import i18n from 'i18n';
import {useQueryClient} from 'react-query';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Language from '@mui/icons-material/Language';
import {axiosClient} from 'utils/axios-utils';
import {languageMap} from 'utils/utils';
import {ReactComponent as PolygonTop} from '../assets/icons/polygonTop.svg';
import {ReactComponent as PolygonBottom} from '../assets/icons/polygonBottom.svg';
import {ReactComponent as MaintenyLogo} from '../assets/icons/MaintenyLogo.svg';
import {MenuBtn} from './MenuBtn';

interface Props {
  children: React.ReactNode;
}

const useStyles = makeStyles({
  leftBackground: {
    background: 'linear-gradient(180deg, #095369 0%, #043146 100%)',
  },
  leftContentText: {
    color: '#fff',
  },
});

export const AuthLayout = ({children}: Props) => {
  const {t} = useTranslation();
  const classes = useStyles();
  const queryClient = useQueryClient();
  const [selectedLng, setSelectedLng] = useState('');
  useEffect(() => {
    const {language} = i18n;
    setSelectedLng(language.split('-')[0].toUpperCase());
  }, []);

  const changeLanguage = (lang: string, label: string) => {
    setSelectedLng(label);
    i18n.changeLanguage(lang);
    axiosClient.defaults.headers.common.language = languageMap[lang];
    queryClient.resetQueries();
  };

  return (
    <Box display="flex" minHeight="100vh" sx={{backgroundColor: '#fff'}}>
      <Box
        className={classes.leftBackground}
        width="38vw"
        minHeight="100%"
        position="relative"
        display="flex"
        justifyContent="center"
        alignItems="center">
        <Box style={{position: 'absolute', top: 0, left: 0, right: 0}}>
          <PolygonTop width="100%" />
        </Box>

        <Box>
          <Box marginBottom="5rem">
            <Typography variant="h3" color="#fff" textAlign="center">
              Mainteny
            </Typography>
            <Typography color="#fff" variant="h5" textAlign="center">
              {t('Service Manager Portal')}
            </Typography>
          </Box>
          <Typography
            color="textSecondary"
            variant="h6"
            width="100%"
            textAlign="center"
            paddingLeft={4}
            paddingRight={4}>
            {t(
              `The unified Application made for Service Managers with smart job assignments, real-time overview of Units under Maintenance (UuM) and out-of-the-box ERP Integrations!`,
            )}
          </Typography>
        </Box>
        <Box style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          <PolygonBottom width="100%" />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            '& .MuiButton-root': {
              color: 'text.secondary',
            },
          }}>
          <MenuBtn
            startIcon={<Language />}
            label={selectedLng}
            menu={[
              {
                label: 'English',
                action: () => changeLanguage('en-US', 'EN'),
              },
              {
                label: 'Deutsch',
                action: () => changeLanguage('de-DE', 'DE'),
              },
            ]}
          />
        </Box>
      </Box>

      <Box
        display="flex"
        flexGrow={1}
        justifyContent="center"
        alignItems="center">
        <Box>
          <Box display="flex" justifyContent="center">
            <MaintenyLogo />
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
