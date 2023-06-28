import {CardProps} from 'components/CardProps';
import useTheme from '@mui/material/styles/useTheme';
import {ServiceCompanyItem} from 'models/service-company';
import {
  AccessTime,
  AvTimer,
  CalendarToday,
  Language,
} from '@mui/icons-material';

import {languages, timeFormats} from './EditSettings';

interface Props {
  label: string;
  company: ServiceCompanyItem;
}

export const SettingsSchema = ({label, company}: Props) => {
  const theme = useTheme();
  const renderSection = () => {
    switch (label) {
      case 'language':
        return (
          <CardProps
            icon={<Language sx={{color: theme.palette.info.dark}} />}
            label="LANGUAGE"
            bodyText={
              company?.language
                ? languages.find((item) => item.value === company.language)
                    ?.label
                : company?.language || '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'dateFormat':
        return (
          <CardProps
            icon={<CalendarToday sx={{color: theme.palette.info.dark}} />}
            label="DATE FORMAT"
            bodyText={company?.settings.dateFormat.toLowerCase() || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'timeFormat':
        return (
          <CardProps
            icon={<AvTimer sx={{color: theme.palette.info.dark}} />}
            label="TIME FORMAT"
            bodyText={
              company?.settings?.timeFormat
                ? timeFormats.find(
                    (item) => item.value === company.settings?.timeFormat,
                  )?.label
                : company?.language || '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'timeZone':
        return (
          <CardProps
            icon={<AccessTime sx={{color: theme.palette.info.dark}} />}
            label="TIME ZONE"
            bodyText={company?.settings?.timezone || '-'}
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
