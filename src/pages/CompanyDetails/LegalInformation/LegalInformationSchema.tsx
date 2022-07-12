import {CardProps} from 'components/CardProps';
import useTheme from '@mui/material/styles/useTheme';
import {ServiceCompanyItem} from 'models/service-company';
import {Contacts, HomeRepairService, Person} from '@mui/icons-material';

interface Props {
  label: string;
  company: ServiceCompanyItem;
}

export const LegalInformationSchema = ({label, company}: Props) => {
  const theme = useTheme();

  const renderSection = () => {
    switch (label) {
      case 'managingDirector':
        return (
          <CardProps
            icon={<Person sx={{color: theme.palette.info.dark}} />}
            label="MANAGING DIRECTOR"
            bodyText={company?.settings?.managingDirector || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'arbitrationCourt':
        return (
          <CardProps
            icon={<HomeRepairService sx={{color: theme.palette.info.dark}} />}
            label="ARBITRATION COURT"
            bodyText={company?.settings?.arbitrationCourt || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'tradeRegisterNumber':
        return (
          <CardProps
            icon={<Contacts sx={{color: theme.palette.info.dark}} />}
            label="TRADE REGISTER NUMBER"
            bodyText={company?.settings?.tradeRegisterNumber || '-'}
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
