import {ChangeEvent, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {theme} from 'theme';
import {grey} from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import {ServiceOrderView} from 'models/service-order';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {useFormatDate} from 'hooks/useFormatDate';
import {useTranslation} from 'react-i18next';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {fromDateStringToDate} from 'utils/datetime';

interface Props {
  scheduleType?: 'date' | 'people' | 'default';
  item?: any;
  scheduleItems: {[key: string]: ServiceOrderView[]};
  makeLabelSelectable?: boolean;
  checkboxValue?: string;
  id: string;
  getCheckedValue?: (checked: boolean, value: string) => void;
  checkedValues?: string[];
  navigateTo?: string;
}

export const ScheduleLabel = ({
  scheduleType = 'default',
  item = '',
  scheduleItems,
  makeLabelSelectable,
  checkboxValue = '',
  getCheckedValue = () => {},
  id,
  checkedValues = [],
  navigateTo,
}: Props) => {
  const {user} = useUserSession();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (getCheckedValue) {
      getCheckedValue(event.target.checked, event.target.value);
    }
  }, []);

  const getDayString = (dateString: string) => {
    const dateFormat = user?.userAccount.serviceCompany.settings.dateFormat;

    const date = fromDateStringToDate(dateString, dateFormat);

    return formatDate(date, 'EEEE');
  };
  const renderSubLabel = () => (
    <Typography variant="caption" sx={{color: grey[600]}}>
      {scheduleType === 'date'
        ? getDayString(item[0]) || ''
        : scheduleItems[id]?.length === 1
        ? t('1 Order')
        : scheduleItems[id]?.length > 1
        ? t('{{numberOfOrders}} Orders', {
            numberOfOrders: scheduleItems[id]?.length,
          })
        : t('0 Order')}
    </Typography>
  );

  const renderSelectableLabel = () => (
    <FormCheckbox
      checked={checkedValues.includes(checkboxValue)}
      value={checkboxValue}
      handleChange={handleChange}
      label={item}
      typographyProps={{variant: 'subtitle2'}}
      checkboxProps={{
        sx: {
          color: theme.palette.text.secondary,
          '&.Mui-checked': {
            color: theme.palette.primary.light,
          },
        },
      }}
    />
  );

  if (makeLabelSelectable) {
    return renderSelectableLabel();
  }

  return (
    <Typography component="div">
      <Typography
        component="span"
        variant="subtitle2"
        sx={{cursor: navigateTo ? 'pointer' : 'initial'}}
        onClick={() => {
          if (navigateTo) navigate(navigateTo);
        }}>
        {item}
      </Typography>
      <br />
      {renderSubLabel()}
    </Typography>
  );
};
