import {CardProps} from 'components/CardProps';
import useTheme from '@mui/material/styles/useTheme';
import {ServiceCompanyItem} from 'models/service-company';
import {Margin, Nightlight} from '@mui/icons-material';

import {convertToText} from 'utils/utils';

interface Props {
  label: string;
  company: ServiceCompanyItem;
}

export const DispatchingSchema = ({label, company}: Props) => {
  const theme = useTheme();

  const renderSection = () => {
    switch (label) {
      case 'isNightlyShuffleEnabled':
        return (
          <CardProps
            icon={<Nightlight sx={{color: theme.palette.info.dark}} />}
            label="DAILY DISPATCH (NIGHTLY SHUFFLE)"
            bodyText={
              company?.settings?.nightlyShuffleEnabled ? 'Enabled' : 'Disabled'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'companyDispatchStrategy':
        return (
          <CardProps
            icon={<Margin sx={{color: theme.palette.info.dark}} />}
            label="DISPATCHING STRATEGY"
            bodyText={
              company?.settings?.companyDispatchStrategy
                ? convertToText(company?.settings?.companyDispatchStrategy)
                : '-'
            }
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
