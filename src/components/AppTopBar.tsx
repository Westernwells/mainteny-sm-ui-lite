import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import useTheme from '@mui/material/styles/useTheme';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import i18n from 'i18n';
import {useAuth} from 'hooks/useAuth';
import {useContext, useEffect} from 'react';
import {axiosClient} from 'utils/axios-utils';
import {Role} from 'models/user';
import {convertToText, languageMap} from 'utils/utils';
import {useQueryClient} from 'react-query';
import {Notifications} from 'pages/Notifications';
import {LanguageContext} from 'context/LanguageProvider';
import {Language} from 'models/misc';
import {useUserSession} from '../hooks/reactQuery/useUserSession';
import {MenuBtn} from './MenuBtn';
import {BackAction} from './BackAction';
import EcologyGlobeMessage from '../assets/icons/EcologyGlobeMessage.svg';

interface Props {
  pageTitle?: string;
  showBackAction?: boolean;
  backBtnLabel?: string;
}

export const AppTopBar = ({
  pageTitle,
  showBackAction,
  backBtnLabel = '',
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {signout} = useAuth();
  const {user, updateUser} = useUserSession();
  const queryClient = useQueryClient();
  const {language: selectedLng, setLanguage} = useContext(LanguageContext);
  const fullName = `${user?.userAccount.firstName} ${user?.userAccount.lastName}`;

  useEffect(() => {
    if (user) {
      const {language: lang} = user.userAccount.serviceCompany;
      axiosClient.defaults.headers.common.language = lang;
      i18n.changeLanguage(lang);
      const value = lang.split('-')[0].toUpperCase();
      setLanguage(value);
      queryClient.invalidateQueries();
    }
  }, [user]);

  const changeLanguage = (lang: string) => {
    updateUser({
      ...user!,
      userAccount: {
        ...user!.userAccount,
        serviceCompany: {
          ...user!.userAccount.serviceCompany,
          language: languageMap[lang] as Language,
        },
      },
    });
  };

  const profileBtnLabel = () => (
    <Box display="flex" flexDirection="column" alignItems="flex-start">
      <Typography
        color="#222B45"
        variant="subtitle1"
        gutterBottom={false}
        sx={{textTransform: 'capitalize'}}>
        {fullName}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{
          textTransform: 'capitalize',
          fontSize: '0.875rem',
          padding: 0,
          color: theme.palette.text.secondary,
        }}>
        {user
          ? convertToText(
              user.userAccount.roles.includes(Role.SERVICE_MANAGER)
                ? Role.SERVICE_MANAGER
                : user.userAccount.roles[0],
            )
          : '-'}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
      }}>
      <Box width="4.5rem" />
      <Box sx={{display: 'flex', justifyContent: 'space-between', flexGrow: 1}}>
        {showBackAction ? (
          <BackAction label={backBtnLabel} containerStyle={{mt: '1em'}} />
        ) : null}
        <Typography
          variant="h4"
          component="div"
          sx={{display: 'flex', alignItems: 'center', mt: '0.2em'}}>
          {pageTitle || null}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" mt={1} alignItems="center">
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
              label={selectedLng}
              menu={[
                {
                  label: 'English',
                  action: () => changeLanguage('en-US'),
                },
                {
                  label: 'Deutsch',
                  action: () => changeLanguage('de-DE'),
                },
                {
                  label: 'Serbian',
                  action: () => changeLanguage('sr-SP'),
                },
                {
                  label: 'Italian',
                  action: () => changeLanguage('it-IT'),
                },
                {
                  label: 'Russian',
                  action: () => changeLanguage('ru-RU'),
                },
              ]}
            />
          </Box>
          <Notifications />
          <Box ml={2} display="flex" alignItems="center">
            <Avatar alt={fullName} src={user?.userAccount.photoUrl} />
            <MenuBtn
              endIcon={
                <ArrowDropDownIcon sx={{color: theme.palette.action.active}} />
              }
              label={profileBtnLabel()}
              menu={[
                {
                  label: t('Logout'),
                  action: () => {
                    signout();
                  },
                },
              ]}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
