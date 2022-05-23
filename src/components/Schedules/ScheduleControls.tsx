import Box from '@mui/material/Box';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Typography from '@mui/material/Typography';
import {SearchInput} from 'components/SearchInput';

interface Props {
  scheduleType?: 'date' | 'people' | 'default';
  item: string;
  prevMonth?: () => void;
  nextMonth?: () => void;
  searchPlaceholder?: string;
  getSearchValue?: (val: string) => void;
}

export const ScheduleControls = ({
  scheduleType = 'default',
  item,
  prevMonth = () => {},
  nextMonth = () => {},
  searchPlaceholder = '',
  getSearchValue = () => {},
}: Props) => {
  const renderDateContols = () => (
    <Box sx={{display: 'flex'}}>
      <Box onClick={() => prevMonth()} sx={{cursor: 'pointer'}}>
        <ArrowBackIosIcon sx={{fontSize: '0.8rem'}} />
      </Box>

      <Typography variant="tableHeaderText" ml="0.5em" mr="0.9em">
        {item}
      </Typography>

      <Box onClick={() => nextMonth()} sx={{cursor: 'pointer'}}>
        <ArrowForwardIosIcon sx={{fontSize: '0.8rem'}} />
      </Box>
    </Box>
  );

  const renderSearch = () => (
    <SearchInput
      placeholder={searchPlaceholder}
      onValueChanged={(searchValue) =>
        getSearchValue && getSearchValue(searchValue)
      }
      containerStyle={{
        background: '#fff',
        width: '90%',
      }}
    />
  );

  const renderDefault = () => (
    <Typography variant="subtitle2">{item}</Typography>
  );

  if (scheduleType === 'date') {
    return renderDateContols();
  }

  if (scheduleType === 'people') {
    return renderSearch();
  }

  return renderDefault();
};
