import * as _ from 'lodash';
import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import Avatar from '@mui/material/Avatar';
import useTheme from '@mui/material/styles/useTheme';
import {PageCard} from 'components/PageCard';

import technicianImage from 'assets/images/avatar.png';
import {MaintainerView, TechnicianView} from 'models/technician';
import {TechnSectionStyles as sx} from '../../styles';

export interface TechnicianSectionProp {
  maintainers: MaintainerView[];
}

export const TechnicianSection = ({maintainers}: TechnicianSectionProp) => {
  const theme = useTheme();

  const [technician, setTechnician] = useState<TechnicianView>();
  const [rows, setRows] = useState<{[key: string]: any}[]>();

  useEffect(() => {
    if (maintainers && maintainers.length > 0) {
      const maintainer = _.sortBy(maintainers, (item) => [
        -item.weight,
        item.technician.userAccount.firstName,
        item.technician.userAccount.lastName,
      ])[0];

      setTechnician(maintainer.technician);
    }
  }, [maintainers]);

  useEffect(() => {
    if (technician) {
      const result = [
        {
          label: `${technician?.userAccount.firstName} ${technician?.userAccount.lastName}`,
          value: 'Sr.Technician',
          icon: technicianImage,
        },
        {
          label: 'company',
          value: technician.userAccount.serviceCompany.name, // TODO use dynamic data
          icon: <BadgeOutlinedIcon sx={sx.icon} />,
        },
        {
          label: 'Email',
          value: `${technician?.userAccount.contact.email}`,
          icon: <EmailOutlinedIcon sx={sx.icon} />,
        },
        {
          label: 'Phone',
          value: `${technician?.userAccount.contact.phone}`,
          icon: <CallOutlinedIcon sx={sx.icon} />,
        },
      ];
      setRows(result);
    }
  }, [technician]);

  return (
    <PageCard
      headerLabel={`Technician (${technician ? 1 : 0})`}
      minHeight="30rem">
      {rows?.map((item, index) => (
        <Box
          key={`${item}-${index}`}
          display="flex"
          mt={index !== 0 ? '1.3em' : undefined}>
          <Box mr="1.2em">
            {index === 0 ? (
              <Box>
                <Avatar alt="Tech" src={technicianImage} sx={sx.avatar} />
              </Box>
            ) : (
              <Box sx={sx.iconContainer}>{item.icon}</Box>
            )}
          </Box>
          <Box>
            <Typography
              variant={index === 0 ? 'subtitle2' : 'caption'}
              color={
                index === 0
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary
              }>
              {item.label}
            </Typography>
            <Typography
              variant="body2"
              color={
                index === 0
                  ? theme.palette.text.secondary
                  : theme.palette.primary.main
              }>
              {item.value}
            </Typography>
          </Box>
        </Box>
      ))}
    </PageCard>
  );
};
