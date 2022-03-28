import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import {CardProps} from 'components/CardProps';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import {BasicDetailsCard} from 'components/BasicDetailsCard';
import Typography from '@mui/material/Typography';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {formatDate, getDateObject} from 'utils/datetime';
import {useGetCustomer} from 'hooks/reactQuery/useCustomers';

interface Props {
  customerId?: string;
}

export const OverviewTab = ({customerId}: Props) => {
  const theme = useTheme();
  const {data: customer} = useGetCustomer(customerId);
  return (
    <BasicDetailsCard
      minHeight="12rem"
      headerStyles={{pb: '0'}}
      header={<Typography variant="subtitle1">#785371</Typography>}>
      <Box display="flex" flexWrap="wrap">
        <CardProps
          label="CUSTOMER NAME"
          bodyTextVariant="body2"
          icon={<HomeWorkIcon sx={{color: theme.palette.info.dark}} />}
          containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
          iconBackground={theme.palette.info.outlinedHoverBg}
          iconMaxHeight="3rem"
          bodyText={customer?.name || ''}
        />

        <CardProps
          label="PHONE NUMBER"
          bodyTextVariant="body2"
          icon={<LocalPhoneIcon sx={{color: theme.palette.info.dark}} />}
          containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
          iconBackground={theme.palette.info.outlinedHoverBg}
          iconMaxHeight="3rem"
          bodyText={customer?.contact.phone || ''}
        />

        <CardProps
          label="CUSTOMER SINCE"
          bodyTextVariant="body2"
          icon={<WorkIcon sx={{color: theme.palette.info.dark}} />}
          containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
          iconBackground={theme.palette.info.outlinedHoverBg}
          iconMaxHeight="3rem"
          bodyText={
            customer
              ? (formatDate(
                  getDateObject(customer.meta.createdAt),
                  'dd MMMM yyy',
                ) as string)
              : ''
          }
        />

        <CardProps
          label="ADDRESS"
          bodyTextVariant="body2"
          icon={<HomeIcon sx={{color: theme.palette.info.dark}} />}
          containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
          iconBackground={theme.palette.info.outlinedHoverBg}
          iconMaxHeight="3rem"
          bodyText={customer?.address.fullName || ''}
        />

        <CardProps
          label="EMAIL ID"
          bodyTextVariant="body2"
          icon={<EmailIcon sx={{color: theme.palette.info.dark}} />}
          containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
          iconBackground={theme.palette.info.outlinedHoverBg}
          iconMaxHeight="3rem"
          bodyText={customer?.contact.email || ''}
        />
      </Box>
    </BasicDetailsCard>
  );
};
