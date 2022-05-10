import React, {useRef} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {BasicDetailsCard} from 'components/BasicDetailsCard';
import EditIcon from '@mui/icons-material/Edit';
import useTheme from '@mui/material/styles/useTheme';
import Button from '@mui/material/Button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {convertToText} from 'utils/utils';
import {CardProps} from 'components/CardProps';
import {ServiceOrder} from 'models/service-order';
import {orderInfo as orderInfoSchema} from './schema';

interface Props {
  serviceOrderDetails: ServiceOrder;
}

export const OrderInfoCard = ({serviceOrderDetails}: Props) => {
  const theme = useTheme();
  const orderInfo = useRef(orderInfoSchema(serviceOrderDetails)).current;
  return (
    <BasicDetailsCard
      containerStyles={{display: 'flex', flexDirection: 'column'}}
      headerActionIcon={<MoreVertIcon sx={{color: theme.state.aubergine}} />}
      header={
        <Box>
          <Typography variant="subtitle1">MT-0004358</Typography>
          <Box sx={{display: 'flex'}}>
            <Typography variant="body2" sx={{mr: '0.2em'}}>
              2 people are stuck
            </Typography>
            <EditIcon
              style={{color: theme.palette.text.secondary}}
              fontSize="small"
            />
          </Box>
        </Box>
      }>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}>
        {Object.values(orderInfo).map((item, index) => (
          <CardProps
            key={`${index}`}
            label={item.label}
            icon={item.icon}
            bodyText={convertToText(item.value!)}
            containerStyles={{mb: '0.5em', width: '27%'}}
            // containerStyles={{alignContent: 'flex-start'}}
            iconMaxHeight="3rem"
            iconBackground={theme.palette.info.outlinedHoverBg}
          />
        ))}
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
        <Button variant="text" size="small" sx={{px: '2.5em', mt: '1em'}}>
          Cancel
        </Button>
        <Button variant="contained" size="small" sx={{px: '2.5em', mt: '1em'}}>
          Schedule
        </Button>
      </Box>
    </BasicDetailsCard>
  );
};
