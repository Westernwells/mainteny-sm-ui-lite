import Box from '@mui/material/Box';
import Language from '@mui/icons-material/Language';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import useTheme from '@mui/material/styles/useTheme';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import i18n from 'i18n';
import {useAuth} from 'hooks/useAuth';
import {useEffect, useState} from 'react';
import {axiosClient} from 'utils/axios-utils';
import {useQueryClient} from 'react-query';
import {languageMap} from 'utils/utils';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {useUserSession} from '../hooks/reactQuery/useUserSession';
import {MenuBtn} from './MenuBtn';
import {BackAction} from './BackAction';

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
  const theme = useTheme();
  const [selectedLng, setSelectedLng] = useState('');
  const {signout} = useAuth();
  const {user} = useUserSession();
  const fullName = `${user?.userAccount.firstName} ${user?.userAccount.lastName}`;
  const queryClient = useQueryClient();

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

  const profileBtnLabel = () => (
    <Box ml={2}>
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
        {user?.userAccount.roles[0].split('_').join(' ').toLowerCase()}
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
              startIcon={<Language sx={{color: '#231F20'}} />}
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
          {/* 
          TODO: Implement notifications
          <Link to="/notifications">
            <Badge
              badgeContent={1}
              overlap="circular"
              color="error"
              sx={{
                marginLeft: 4,
                marginTop: 1,
                color: '#FF4B55',
                cursor: 'pointer',
              }}>
              <NotificationsNoneIcon color="primary" />
            </Badge>
          </Link> */}
          <Box ml={2} display="flex" alignItems="center">
            <Avatar alt={fullName} src={user?.userAccount.photoUrl} />
            <MenuBtn
              endIcon={
                <ArrowDropDownIcon sx={{color: theme.palette.action.active}} />
              }
              label={profileBtnLabel()}
              menu={[
                {
                  label: 'Logout',
                  action: () => {
                    Mixpanel.identifyAndTrack(mixpanelEvents.LOGOUT);
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
