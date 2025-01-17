import Box from '@mui/material/Box';
import {PageCard} from 'components/PageCard';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {useFormatDate} from 'hooks/useFormatDate';
import {
  ServiceOrderReportView,
  ServiceOrderStatus,
  ServiceOrderView,
} from 'models/service-order';
import {
  getJobTypeGivenName,
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import Grid from '@mui/material/Grid';
import {HandymanOutlined, InfoOutlined} from '@mui/icons-material';
import {CardProps} from 'components/CardProps';
import {theme} from 'theme';
import React, {Dispatch, SetStateAction, useState} from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {Chip, FormControl, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useGetTechniciansByEmployeeId} from 'hooks/reactQuery/useTechnician';
import {getTechnicianName} from 'utils/employee';
import {useCompanyJobTypes} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

interface Props {
  date: string;
  type: string;
  number: string;
  status: ServiceOrderStatus;
  order: ServiceOrderView;
  onReportChange: Dispatch<SetStateAction<ServiceOrderReportView | undefined>>;
}

export const ReportCard = ({
  date,
  type,
  number,
  status,
  order,
  onReportChange,
}: Props) => {
  const formatDate = useFormatDate();
  const reports = order.reports || [];
  const {t} = useTranslation();
  const {user} = useUserSession();
  const {data: jobTypes} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  const labels =
    reports.map((r) => {
      const schedule = order.schedules.find(
        (s) => s.technician.id === r?.technicianId,
      );

      const {data: selectedTechnician} = useGetTechniciansByEmployeeId(
        r?.technicianId || '',
      );

      const technicianName = getTechnicianName(schedule, selectedTechnician);

      return {
        value: r.id,
        label: `${r.number || ''} - ${technicianName}`,
      };
    }) || [];

  const [selectedRole, setSelectedRole] = useState(labels[0]?.value || '');

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value);
    const currentReport = reports.find(
      (report) => report.id === event.target.value,
    );
    onReportChange(currentReport);
  };

  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={12}
        md={8}
        sx={{
          py: '0em',
        }}>
        <PageCard
          headerLabel="General Information"
          headerIcon={
            <InfoOutlined sx={{color: theme.palette.text.secondary}} />
          }
          contentContainerStyles={{
            display: 'flex',
            flex: 'wrap',
            justifyContent: 'space-between',
            pb: '0.5em !important',
          }}>
          <Grid container rowGap={2}>
            <Grid item xs={6} sm={4} md={3}>
              <CardProps
                label="Date"
                containerStyles={{alignItems: 'center'}}
                bodyTextVariant="subtitle1"
                iconMaxHeight="3rem"
                bodyText={formatDate(date)}
                bodyStyle={{fontWeight: '600'}}
                iconContainerStyles={{'& path': {fill: 'red'}}}
                labelStyle={{
                  textTransform: 'none',
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <CardProps
                label="Type"
                bodyTextVariant="subtitle1"
                iconMaxHeight="3rem"
                containerStyles={{alignItems: 'center'}}
                bodyText={
                  <Box display="flex" alignItems="center" gap={1}>
                    <ServiceOrderIcons serviceOrderType={type} size="small" />
                    <ServiceOrderTypeText
                      serviceOrderType={getJobTypeGivenName(type, jobTypes)}
                      capitalizeText
                      variant="subtitle1"
                      style={{fontWeight: '600'}}
                    />
                  </Box>
                }
                bodyStyle={{fontWeight: '600'}}
                iconContainerStyles={{'& path': {fill: 'red'}}}
                labelStyle={{
                  textTransform: 'none',
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <CardProps
                label="Job ID"
                bodyTextVariant="subtitle1"
                iconMaxHeight="3rem"
                containerStyles={{alignItems: 'center'}}
                bodyText={number}
                bodyStyle={{fontWeight: '600'}}
                iconContainerStyles={{'& path': {fill: 'red'}}}
                labelStyle={{
                  textTransform: 'none',
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <CardProps
                label="Status"
                bodyTextVariant="subtitle1"
                iconMaxHeight="3rem"
                containerStyles={{alignItems: 'center'}}
                bodyText={
                  <StatusChip
                    color={getServiceOrderStatusColor(status)}
                    label={serviceOrderStatusToString(status)}
                  />
                }
                bodyStyle={{fontWeight: '600'}}
                iconContainerStyles={{'& path': {fill: 'red'}}}
                labelStyle={{
                  textTransform: 'none',
                }}
              />
            </Grid>
          </Grid>
        </PageCard>
      </Grid>
      <Grid
        item
        xs={12}
        md={4}
        sx={{
          py: '0em',
        }}>
        <PageCard
          customHeader={
            <Box display="flex" gap={1}>
              <HandymanOutlined sx={{color: theme.palette.text.secondary}} />

              <Typography sx={{fontWeight: '600'}}>
                {t('Engineer(s)')}
              </Typography>
              <Chip
                label={reports?.length}
                size="small"
                sx={{
                  marginLeft: '0.5rem',
                  color: theme.palette.primary.main,
                  width: '23px',
                  '& .MuiChip-label': {
                    overflow: 'visible',
                  },
                }}
              />
            </Box>
          }
          contentContainerStyles={{
            display: 'flex',
            flex: 'wrap',
            justifyContent: 'space-between',
            pb: '0.5em !important',
          }}>
          <Grid
            sx={{
              minHeight: '60px',
            }}
            container>
            <Grid item xs={12} sm={12} md={12}>
              <FormControl fullWidth sx={{marginBlock: '0.5em'}}>
                <Select
                  labelId="technicianSelect-label"
                  id="technicianSelect"
                  value={selectedRole}
                  size="small"
                  onChange={handleChange}>
                  {labels.map((item) => (
                    <MenuItem value={item.value} key={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </PageCard>
      </Grid>
    </Grid>
  );
};
