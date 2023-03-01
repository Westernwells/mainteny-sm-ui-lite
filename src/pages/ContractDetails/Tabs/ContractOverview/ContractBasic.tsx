import useTheme from '@mui/material/styles/useTheme';
import {CardProps} from 'components/CardProps';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import TodayIcon from '@mui/icons-material/Today';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import TopicIcon from '@mui/icons-material/Topic';
import {Grid} from '@mui/material';
import {StatusChip} from 'components/StatusChip';
import {convertToText} from 'utils/utils';
import {useTranslation} from 'react-i18next';
import CalendarToday from '@mui/icons-material/CalendarToday';
import TrendingUp from '@mui/icons-material/TrendingUp';
import DateRange from '@mui/icons-material/DateRange';
import MoneyOff from '@mui/icons-material/MoneyOff';
import Timer from '@mui/icons-material/Timer';
import {ContractStatus} from 'models/contract';
import {capitalize} from 'lodash';

interface Props {
  name?: string;
  type?: string;
  numberOfVisits?: number;
  costPerYear?: string | number;
  spendingLimit?: string;
  renewalPeriod?: number;
  invoiceCycle?: string;
  numberOfUnits?: number;
  paymentDue?: number;
  yearlyPriceAdjustment?: number;
  noticePreiod?: number;
  discount?: string[];
  hourlyRate?: string;
  status?: ContractStatus;
}

export const ContractBasic = ({
  costPerYear,
  name,
  spendingLimit,
  invoiceCycle,
  numberOfUnits,
  numberOfVisits,
  renewalPeriod,
  paymentDue,
  yearlyPriceAdjustment,
  noticePreiod,
  discount,
  hourlyRate,
  status,
  type,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  return (
    <>
      <StatusChip
        color={
          status === ContractStatus.VALID
            ? 'success'
            : status === ContractStatus.PENDING
            ? 'info'
            : 'error'
        }
        label={capitalize(status!)}
        style={{mb: '1em', float: 'right'}}
      />
      <Grid container rowGap={2}>
        <Grid item xs={4}>
          <CardProps
            label="CONTRACT NAME"
            bodyTextVariant="subtitle1"
            icon={<CardTravelIcon color="info" />}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={convertToText(name || '-')}
          />
        </Grid>

        <Grid item xs={4}>
          <CardProps
            label="CONTRACT TYPE"
            bodyTextVariant="subtitle1"
            icon={<CardTravelIcon color="info" />}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={convertToText(type || '-')}
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            label="NUMBER OF VISITS"
            bodyTextVariant="subtitle1"
            icon={<TodayIcon color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={`${numberOfVisits}` || '-'}
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            label="PRICE/YEAR (Excl VAT)"
            bodyTextVariant="subtitle1"
            icon={<AttachMoneyIcon color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={`${costPerYear}` || '-'}
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            label="SPENDING LIMIT"
            bodyTextVariant="subtitle1"
            icon={<MonetizationOnOutlinedIcon color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={spendingLimit || '-'}
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            label="RENEWAL PERIOD"
            bodyTextVariant="subtitle1"
            icon={<CalendarViewWeekIcon color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={
              renewalPeriod
                ? renewalPeriod > 1
                  ? `${renewalPeriod} months`
                  : `${renewalPeriod} month`
                : '0'
            }
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            label="INVOICE CYCLE"
            bodyTextVariant="subtitle1"
            icon={<WysiwygIcon color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={typeof invoiceCycle === 'string' ? t(invoiceCycle) : '-'}
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            label="NUMBER OF UNITS"
            bodyTextVariant="subtitle1"
            icon={<TopicIcon color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={`${numberOfUnits}` || '-'}
          />
        </Grid>

        <Grid item xs={4}>
          <CardProps
            label="PAYMENT DUE"
            bodyTextVariant="subtitle1"
            icon={<CalendarToday color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={paymentDue ? `${paymentDue} days` : '-'}
          />
        </Grid>

        <Grid item xs={4}>
          <CardProps
            label="YEARLY PRICE ADJUSTMENT"
            bodyTextVariant="subtitle1"
            icon={<TrendingUp color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={yearlyPriceAdjustment ? `${yearlyPriceAdjustment}%` : '-'}
          />
        </Grid>

        <Grid item xs={4}>
          <CardProps
            label="NOTICE PERIOD"
            bodyTextVariant="subtitle1"
            icon={<DateRange color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={noticePreiod ? `${noticePreiod} months` : '-'}
          />
        </Grid>

        <Grid item xs={4}>
          <CardProps
            label="DISCOUNT"
            bodyTextVariant="subtitle1"
            icon={<MoneyOff color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={discount ? `${discount}` : '-'}
          />
        </Grid>

        <Grid item xs={4}>
          <CardProps
            label="HOURLY RATE"
            bodyTextVariant="subtitle1"
            icon={<Timer color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={hourlyRate ? `${hourlyRate}` : '-'}
          />
        </Grid>
      </Grid>
    </>
  );
};
