import React, {useEffect, useState} from 'react';
import i18n from 'i18n';
import {useQueryClient} from 'react-query';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import {axiosClient} from 'utils/axios-utils';
import {languageMap} from 'utils/utils';
import useTheme from '@mui/material/styles/useTheme';
import {ReactComponent as PolygonTop} from '../assets/icons/polygonTop.svg';
import {ReactComponent as PolygonBottom} from '../assets/icons/polygonBottom.svg';
import {ReactComponent as MaintenyLogo} from '../assets/icons/MaintenyLogo.svg';
import {MenuBtn} from './MenuBtn';
import EcologyGlobeMessage from '../assets/icons/EcologyGlobeMessage.svg';

interface Props {
  children: React.ReactNode;
}

const useStyles = makeStyles({
  leftBackground: {
    background: '#000034',
  },
  leftContentText: {
    color: '#fff',
  },
});

export const AuthLayout = ({children}: Props) => {
  const themeX = useTheme();
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
          <Box marginBottom="32px">
            <Typography variant="h3" color="#fff" textAlign="center">
              Mainteny
            </Typography>
            <Typography
              color="#fff"
              variant="h5"
              textAlign="center"
              fontWeight="200"
              letterSpacing="0.02em">
              {t('Service Manager Portal')}
            </Typography>
          </Box>
          <Typography
            color="textSecondary"
            variant="h6"
            width="100%"
            textAlign="center"
            paddingLeft={4}
            paddingRight={4}
            lineHeight={1.8}
            sx={{
              [themeX.breakpoints.up('xl')]: {
                paddingLeft: '8em',
                paddingRight: '8em',
              },
            }}
            fontWeight="400">
            {t(
              `The unified Application made for Service Managers with smart job assignments, real-time overview of Units under Maintenance (UuM) and out-of-the-box ERP Integrations!`,
            )}
          </Typography>
        </Box>
        <Box style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          <PolygonBottom width="100%" />
        </Box>
      </Box>

      <Box
        display="flex"
        flexGrow={1}
        justifyContent="center"
        alignItems="center"
        position="relative">
        <Box>
          <Box display="flex" justifyContent="center">
            <MaintenyLogo width={236} height={49} />
          </Box>
          {children}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '1%',
            left: '2%',
            '& .MuiButton-root': {
              color: 'text.secondary',
            },
          }}>
          <MenuBtn
            startIcon={
              <img
                style={{width: 25, height: 25}}
                src={EcologyGlobeMessage}
                alt="globe"
              />
            }
            menuListProps={{id: 'selectLanguageMenuList'}}
            id="selectLanguageButton"
            label={
              selectedLng === 'EN'
                ? 'English'
                : selectedLng === 'DE'
                ? 'Deutsch'
                : selectedLng === 'SR'
                ? 'Serbian'
                : 'Italian'
            }
            menu={[
              {
                label: 'English',
                action: () => changeLanguage('en-US', 'EN'),
              },
              {
                label: 'Deutsch',
                action: () => changeLanguage('de-DE', 'DE'),
              },
              {
                label: 'Serbian',
                action: () => changeLanguage('sr-rs', 'SR'),
              },
              {
                label: 'Italian',
                action: () => changeLanguage('it-it', 'IT'),
              },
            ]}
          />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: '1.5%',
            right: '2%',
            '& .MuiButton-root': {
              color: 'text.secondary',
            },
          }}>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              letterSpacing: '0.035em',
            }}>
            ©2023 Mainteny. All rights reserved. <br /> Mainteny® is a
            registered trademark.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
