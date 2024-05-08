import {useState} from 'react';
import {Box, IconButton, Typography} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import {useTranslation} from 'react-i18next';
import {ServiceCompanyContactPersonView} from 'models/contacts';
import {convertToText} from 'utils/utils';
import ContactFormDialog from '../ContactFormDialog';

interface Props {
  contactPerson: ServiceCompanyContactPersonView | undefined;
}

const ContactHeaderInfo = ({contactPerson}: Props) => {
  const {t} = useTranslation();

  const [openDialog, setOpenDialog] = useState(false);

  const infoItems = [
    {
      icon: <PersonOutlinedIcon sx={{color: 'action.active'}} width={16} />,
      label: t('Role'),
      value: t(convertToText(contactPerson?.userAccount.roles[0] || '')),
    },
    {
      icon: (
        <BusinessCenterOutlinedIcon sx={{color: 'action.active'}} width={16} />
      ),
      label: t('Company'),
      value: contactPerson?.companyName || '-',
    },
    {
      icon: <PhoneOutlinedIcon sx={{color: 'action.active'}} width={16} />,
      label: t('Phone 1'),
      value: contactPerson?.userAccount?.contact?.phone || '-',
    },
    {
      icon: <PhoneOutlinedIcon sx={{color: 'action.active'}} width={16} />,
      label: t('Phone 2'),
      value: contactPerson?.additionalInfo?.secondaryPhone || '-',
    },
  ];

  return (
    <>
      <ContactFormDialog
        contactPerson={contactPerson}
        formType="edit"
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
      <Box display="flex" flexDirection="column" gap="0.5rem">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            color="text.secondary"
            fontWeight={600}
            letterSpacing={1.1}>
            {t('INFORMATION')}
          </Typography>
          <IconButton onClick={() => setOpenDialog(true)}>
            <EditOutlinedIcon />
          </IconButton>
        </Box>
        <Box display="flex" gap="3.5rem">
          <Box
            display="flex"
            flexDirection="column"
            width="fit-content"
            gap="0.5rem">
            {infoItems.map(({icon, label}) => (
              <Box display="flex" alignItems="center" key={label}>
                {icon}
                <Typography
                  variant="body2"
                  sx={{ml: '0.5rem', color: 'text.secondary'}}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            width="fit-content"
            gap="0.5rem">
            {infoItems.map(({value}) => (
              <Typography sx={{ml: '0.5rem'}}>{value}</Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ContactHeaderInfo;
