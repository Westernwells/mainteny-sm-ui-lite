import {CardProps} from 'components/CardProps';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import {Grid} from '@mui/material';
import {convertToText} from 'utils/utils';
import {useTranslation} from 'react-i18next';
import TrendingUp from '@mui/icons-material/TrendingUp';
import MoneyOff from '@mui/icons-material/MoneyOff';
import {ReactComponent as InfoIcon} from 'assets/icons/Info.svg';
import {ReactComponent as AutorenewIcon} from 'assets/icons/Autorenew.svg';
import {ReactComponent as NumberIcon} from 'assets/icons/number.svg';
import {ReactComponent as ElevetorIcon} from 'assets/icons/Elevator.svg';
import {ReactComponent as BellIcon} from 'assets/icons/bell.svg';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  name?: string;
  costPerYear?: string | number;
  renewalPeriod?: number;
  numberOfUnits?: number;
  yearlyPriceAdjustment?: number;
  noticePeriod?: number;
  discount?: string[];
  start?: string;
  end?: string;
  contractNumber?: string;
  autoRenewal?: boolean;
}

export const ContractBasic = ({
  costPerYear,
  name,
  numberOfUnits,
  renewalPeriod,
  yearlyPriceAdjustment,
  noticePeriod,
  discount,
  start,
  end,
  autoRenewal,
  contractNumber,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <Grid container rowGap={2}>
      <Grid item xs={6} sm={4} md={3}>
        <CardProps
          label="Contract Name"
          bodyTextVariant="subtitle1"
          icon={<InfoIcon fontSize="1.5rem" />}
          iconMaxHeight="3rem"
          bodyText={convertToText(name || '-')}
          bodyStyle={{fontSize: '16px', fontWeight: '600'}}
          iconContainerStyles={{'& path': {fill: theme.palette.primary.light}}}
          labelStyle={{
            fontSize: '14px',
            textTransform: 'none',
          }}
        />
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <CardProps
          label="Contract Start"
          bodyTextVariant="subtitle1"
          icon={<CardTravelIcon />}
          iconMaxHeight="3rem"
          bodyText={convertToText(start?.replace(/-/g, '.') ?? '-')}
          bodyStyle={{fontSize: '16px', fontWeight: '600'}}
          iconContainerStyles={{'& path': {fill: theme.palette.primary.light}}}
          labelStyle={{
            fontSize: '14px',
            textTransform: 'none',
          }}
        />
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <CardProps
          label="Contract Value"
          bodyTextVariant="subtitle1"
          icon={<AttachMoneyIcon />}
          containerStyles={{mr: '0.5em'}}
          iconMaxHeight="3rem"
          bodyText={`${costPerYear ? `${`${costPerYear}/${t('Year')}`}` : '-'}`}
          bodyStyle={{fontSize: '16px', fontWeight: '600'}}
          iconContainerStyles={{'& path': {fill: theme.palette.primary.light}}}
          labelStyle={{
            fontSize: '14px',
            textTransform: 'none',
          }}
        />
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <CardProps
          label="Auto-renewal"
          bodyTextVariant="subtitle1"
          icon={<AutorenewIcon fontSize="1.5rem" />}
          containerStyles={{mr: '0.5em'}}
          iconMaxHeight="3rem"
          bodyText={autoRenewal ? 'Yes' : 'No'}
          bodyStyle={{fontSize: '16px', fontWeight: '600'}}
          iconContainerStyles={{'& path': {fill: theme.palette.primary.light}}}
          labelStyle={{
            fontSize: '14px',
            textTransform: 'none',
          }}
        />
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <CardProps
          label="Contract Number"
          bodyTextVariant="subtitle1"
          icon={<NumberIcon fontSize="1.5rem" />}
          containerStyles={{mr: '0.5em'}}
          iconMaxHeight="3rem"
          bodyText={contractNumber ?? '-'}
          bodyStyle={{fontSize: '16px', fontWeight: '600'}}
          iconContainerStyles={{'& path': {fill: theme.palette.primary.light}}}
          labelStyle={{
            fontSize: '14px',
            textTransform: 'none',
          }}
        />
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <CardProps
          label="Contract End"
          bodyTextVariant="subtitle1"
          icon={<CardTravelIcon />}
          iconMaxHeight="3rem"
          bodyText={convertToText(end?.replace(/-/g, '.') ?? '-')}
          bodyStyle={{fontSize: '16px', fontWeight: '600'}}
          iconContainerStyles={{'& path': {fill: theme.palette.primary.light}}}
          labelStyle={{
            fontSize: '14px',
            textTransform: 'none',
          }}
        />
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <CardProps
          label="Price Adjustment"
          bodyTextVariant="subtitle1"
          icon={<TrendingUp />}
          bodyText={
            yearlyPriceAdjustment
              ? `${`${yearlyPriceAdjustment}%/${t('Year')}`}`
              : '-'
          }
          bodyStyle={{fontSize: '16px', fontWeight: '600'}}
          iconContainerStyles={{'& path': {fill: theme.palette.primary.light}}}
          labelStyle={{
            fontSize: '14px',
            textTransform: 'none',
          }}
        />
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <CardProps
          label="Renewal period"
          bodyTextVariant="subtitle1"
          icon={<CalendarViewWeekIcon />}
          containerStyles={{mr: '0.5em'}}
          bodyText={
            renewalPeriod && renewalPeriod > 1
              ? t('{{time}} months', {time: renewalPeriod})
              : renewalPeriod && renewalPeriod === 1
              ? t('{{hours}} month', {hours: renewalPeriod})
              : '0'
          }
          bodyStyle={{fontSize: '16px', fontWeight: '600'}}
          iconContainerStyles={{'& path': {fill: theme.palette.primary.light}}}
          labelStyle={{
            fontSize: '14px',
            textTransform: 'none',
          }}
        />
      </Grid>

      <Grid item xs={6} sm={4} md={6}>
        <CardProps
          label="Number of units"
          bodyTextVariant="subtitle1"
          icon={<ElevetorIcon fontSize="1.5rem" />}
          bodyText={`${numberOfUnits}` || '-'}
          bodyStyle={{fontSize: '16px', fontWeight: '600'}}
          iconContainerStyles={{'& path': {fill: theme.palette.primary.light}}}
          labelStyle={{
            fontSize: '14px',
            textTransform: 'none',
          }}
        />
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <CardProps
          label="Invoice Discount"
          bodyTextVariant="subtitle1"
          icon={<MoneyOff />}
          bodyText={discount ? `${discount}` : '-'}
          bodyStyle={{fontSize: '16px', fontWeight: '600'}}
          iconContainerStyles={{'& path': {fill: theme.palette.primary.light}}}
          labelStyle={{
            fontSize: '14px',
            textTransform: 'none',
          }}
        />
      </Grid>

      <Grid item xs={6} sm={4} md={3}>
        <CardProps
          label="Notice period"
          bodyTextVariant="subtitle1"
          icon={<BellIcon />}
          containerStyles={{mr: '0.5em'}}
          iconMaxHeight="3rem"
          bodyText={
            noticePeriod && noticePeriod > 1
              ? t('{{time}} months', {time: noticePeriod})
              : noticePeriod && noticePeriod === 1
              ? t('{{hours}} month', {hours: noticePeriod})
              : !noticePeriod && '-'
          }
          bodyStyle={{fontSize: '16px', fontWeight: '600'}}
          iconContainerStyles={{'& path': {fill: theme.palette.primary.light}}}
          labelStyle={{
            fontSize: '14px',
            textTransform: 'none',
          }}
        />
      </Grid>
    </Grid>
  );
};
