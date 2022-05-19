import Box from '@mui/material/Box';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Typography from '@mui/material/Typography';
import {SearchInput} from 'components/SearchInput';

interface Props {
  scheduleType: string;
  item: string;
  prevMonth: () => void;
  nextMonth: () => void;
  searchPlaceholder: string;
  getSearchValue?: (val: string) => void;
}

export const ScheduleControls = ({
  scheduleType,
  item,
  prevMonth,
  nextMonth,
  searchPlaceholder,
  getSearchValue,
}: Props) => {
  if (scheduleType === 'date') {
    return (
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
  }

  if (scheduleType === 'people') {
    return (
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
  }

  return <Box>{item}</Box>;
};
