import * as _ from 'lodash';
import {Fragment, useEffect, useState} from 'react';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import Avatar from '@mui/material/Avatar';
import useTheme from '@mui/material/styles/useTheme';
import {EmptyItem} from 'components/EmptyItem';
import {PageCard} from 'components/PageCard';

import technicianImage from 'assets/images/avatar.png';
import {MaintainerView, TechnicianView} from 'models/technician';

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
          value: `astralift.nl`, // TODO use dynamic data
          icon: (
            <BadgeOutlinedIcon
              sx={{
                width: '1.125rem',
                color: theme.palette.text.primary,
              }}
            />
          ),
        },
        {
          label: 'Email',
          value: `${technician?.userAccount.contact.email}`,
          icon: (
            <EmailOutlinedIcon
              sx={{
                width: '1.125rem',
                color: theme.palette.text.primary,
              }}
            />
          ),
        },
        {
          label: 'Phone',
          value: `${technician?.userAccount.contact.phone}`,
          icon: (
            <CallOutlinedIcon
              sx={{
                width: '1.125rem',
                color: theme.palette.text.primary,
              }}
            />
          ),
        },
      ];
      setRows(result);
    }
  }, [technician]);

  return (
    <PageCard headerLabel={`Technician (${technician ? 1 : 0})`}>
      {rows?.map((item, index) => (
        <Box display="flex" mt={index !== 0 ? '1.3em' : undefined}>
          <Box mr="1.2em">
            {index === 0 ? (
              <Box>
                <Avatar
                  alt="Tech"
                  src={technicianImage}
                  sx={{width: '3.125rem', height: '3.125rem'}}
                />
              </Box>
            ) : (
              <Box
                sx={{background: theme.palette.background.default}}
                width="3rem"
                height="2.8rem"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {item.icon}
              </Box>
            )}
          </Box>
          <Box>
            <Typography
              variant={index === 0 ? 'subtitle1' : 'caption'}
              color={
                index === 0
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary
              }
            >
              {item.label}
            </Typography>
            <Typography
              variant={index === 0 ? 'body2' : 'body1'}
              color={
                index === 0
                  ? theme.palette.text.secondary
                  : theme.palette.primary.main
              }
            >
              {item.value}
            </Typography>
          </Box>
        </Box>
      ))}
    </PageCard>
  );
};
