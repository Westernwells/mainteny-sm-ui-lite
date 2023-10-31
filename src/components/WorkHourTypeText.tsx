import Typography from '@mui/material/Typography';

import {capitalize} from 'utils/utils';
import {WorkHoursType} from 'models/workHours';
import {formatServiceName} from 'utils/work-hours-utils';
import {useTranslation} from 'react-i18next';

interface Props {
  workHourType?: WorkHoursType | null;
  style?: {[key: string]: string | number};
  variant?: any;
  capitalizeText?: boolean;
}

export const WorkHourTypeText = ({
  workHourType,
  style,
  variant,
  capitalizeText,
}: Props) => {
  const {t} = useTranslation();
  return (
    <Typography component="span" variant={variant || 'caption'} sx={{...style}}>
      {capitalizeText
        ? `${t(capitalize([formatServiceName(workHourType)]))}`
        : formatServiceName(workHourType)}
    </Typography>
  );
};
