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

interface Props {
  type?: string;
  numberOfVisits?: number;
  costPerYear?: string | number;
  spendingLimit?: string;
  renewalPeriod?: number;
  invoiceDue?: string;
  numberOfUnits?: number;
}

export const ContractBasic = ({
  costPerYear,
  type,
  spendingLimit,
  invoiceDue,
  numberOfUnits,
  numberOfVisits,
  renewalPeriod,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  return (
    <>
      <StatusChip
        color="success"
        label="Active"
        style={{mb: '1em', float: 'right'}}
      />
      <Grid container rowGap={2}>
        <Grid item xs={4}>
          <CardProps
            label="TYPE"
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
            label="INVOICE DUE"
            bodyTextVariant="subtitle1"
            icon={<WysiwygIcon color="info" />}
            containerStyles={{mr: '0.5em'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText={typeof invoiceDue === 'string' ? t(invoiceDue) : '-'}
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
      </Grid>
    </>
  );
};
