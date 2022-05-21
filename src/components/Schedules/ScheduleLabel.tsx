/* eslint-disable */
import {ChangeEvent, useCallback, useState} from 'react';
import Box from '@mui/material/Box';
import {grey} from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import {ServiceOrderView} from 'models/service-order';
import {formatDate} from 'utils/datetime';
import Checkbox from '@mui/material/Checkbox';

interface Props {
  scheduleType: 'date' | 'people' | 'default';
  item: string;
  scheduleItems: {[key: string]: ServiceOrderView[]};
  makeLabelSelectable?: boolean;
  checkboxValue?: string;
  id: string;
  getCheckedValue?: (checked: boolean, value: string) => void;
  checkedValues?: string[];
}

export const ScheduleLabel = ({
  scheduleType,
  item,
  scheduleItems,
  makeLabelSelectable,
  checkboxValue = '',
  getCheckedValue,
  id,
  checkedValues = [],
}: Props) => {
  const [checked, setChecked] = useState(false);
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (getCheckedValue) {
      getCheckedValue(event.target.checked, event.target.value);
    }
    setChecked(event.target.checked);
  }, []);

  const renderSubLabel = () => (
    <Typography variant="caption" sx={{color: grey[600]}}>
      {scheduleType === 'date'
        ? formatDate(new Date(item), 'EEEE')
        : scheduleItems[id]
        ? `${scheduleItems[id].length} ${
            scheduleItems[id].length < 2 ? ' Order' : ' Orders'
          }`
        : '0 Order'}
    </Typography>
  );

  const renderSelectableLabel = () => (
    <Box sx={{display: 'flex'}}>
      <Checkbox
        checked={checkedValues.includes(checkboxValue)}
        value={checkboxValue}
        onChange={handleChange}
      />
      <Typography
        component="div"
        variant="subtitle2"
        sx={{display: 'flex', alignItems: 'center'}}>
        {item}
      </Typography>
    </Box>
  );

  if (makeLabelSelectable) {
    return renderSelectableLabel();
  }

  return (
    <Typography component="div" variant="subtitle2">
      {item} <br />
      {renderSubLabel()}
    </Typography>
  );
};
