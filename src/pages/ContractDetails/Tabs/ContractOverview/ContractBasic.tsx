import Box from '@mui/material/Box';
import {formatDate, toDate} from 'utils/datetime';
import useTheme from '@mui/material/styles/useTheme';
import {CardProps} from 'components/CardProps';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import TodayIcon from '@mui/icons-material/Today';
import TocIcon from '@mui/icons-material/Toc';

interface Props {
  startTime?: string;
  endTime?: string;
  costPerYear?: string;
  type?: string;
}

export const ContractBasic = ({
  startTime,
  endTime,
  costPerYear,
  type,
}: Props) => {
  const theme = useTheme();
  return (
    <Box display="flex">
      <CardProps
        label="Cost per Year"
        bodyTextVariant="subtitle1"
        icon={<MonetizationOnOutlinedIcon color="info" />}
        containerStyles={{mr: '0.5em'}}
        iconBackground={theme.palette.info.outlinedHoverBg}
        iconMaxHeight="3rem"
        bodyText={costPerYear || ''}
      />

      <CardProps
        label="Effective Dates"
        bodyTextVariant="subtitle1"
        icon={<TodayIcon color="info" />}
        iconBackground={theme.palette.info.outlinedHoverBg}
        containerStyles={{flexGrow: 1}}
        iconMaxHeight="3rem"
        bodyText={`${startTime && formatDate(toDate(startTime), 'dd MMM YYY')}
        -
        ${endTime && formatDate(toDate(endTime), 'dd MMM YYY')}`}
      />

      <CardProps
        label="Contract Type"
        bodyTextVariant="subtitle1"
        icon={<TocIcon color="info" />}
        containerStyles={{
          ml: '0.5em',
          display: 'flex',
          justifyContent: 'center',
        }}
        iconBackground={theme.palette.info.outlinedHoverBg}
        iconMaxHeight="3rem"
        bodyText={type || ''}
      />
    </Box>
  );
};
