import {CardProps} from 'components/CardProps';
import useTheme from '@mui/material/styles/useTheme';
import {ServiceCompanyItem} from 'models/service-company';
import {Call, Email, PermContactCalendar, Web} from '@mui/icons-material';

interface Props {
  label: string;
  company: ServiceCompanyItem;
}

export const BasicInformationSchema = ({label, company}: Props) => {
  const theme = useTheme();

  const renderSection = () => {
    switch (label) {
      case 'name':
        return (
          <CardProps
            icon={<PermContactCalendar sx={{color: theme.palette.info.dark}} />}
            label="NAME"
            bodyText={company?.name || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'email':
        return (
          <CardProps
            icon={<Email sx={{color: theme.palette.info.dark}} />}
            label="EMAIL"
            bodyText={company?.contact?.email || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'phone':
        return (
          <CardProps
            icon={<Call sx={{color: theme.palette.info.dark}} />}
            label="PHONE"
            bodyText={company?.contact?.phone || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'website':
        return (
          <CardProps
            icon={<Web sx={{color: theme.palette.info.dark}} />}
            label="WEBSITE"
            bodyText={company?.contact?.url || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );

      default:
        return null;
    }
  };
  return renderSection();
};
