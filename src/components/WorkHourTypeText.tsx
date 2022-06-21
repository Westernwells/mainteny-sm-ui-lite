import Typography from '@mui/material/Typography';

import {capitalize} from 'utils/utils';
import {WorkHoursType} from 'models/workHours';

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
  const formatName = (name: WorkHoursType | null | undefined) => {
    if (name === null) return '-';
    if (name === WorkHoursType.REGULAR) return 'Maintenance';
    if (name === WorkHoursType.EMERGENCY) return 'Emergency';
    if (name === WorkHoursType.CALLOUT) return 'Callout';
    if (name === WorkHoursType.REPAIR) return 'Repair';
    return name;
  };

  return (
    <Typography component="span" variant={variant || 'caption'} sx={{...style}}>
      {capitalizeText
        ? capitalize([formatName(workHourType)])
        : formatName(workHourType)}
    </Typography>
  );
};
