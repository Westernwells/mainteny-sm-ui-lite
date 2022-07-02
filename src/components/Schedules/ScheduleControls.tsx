import Box from '@mui/material/Box';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Typography from '@mui/material/Typography';
import {SearchInput} from 'components/SearchInput';
import {useTranslation} from 'react-i18next';

interface Props {
  scheduleType?: 'date' | 'people' | 'default';
  item: string;
  prevWeek?: () => void;
  nextWeek?: () => void;
  searchPlaceholder?: string;
  getSearchValue?: (val: string) => void;
}

export const ScheduleControls = ({
  scheduleType = 'default',
  item,
  prevWeek = () => {},
  nextWeek = () => {},
  searchPlaceholder = '',
  getSearchValue = () => {},
}: Props) => {
  const renderDateContols = () => (
    <Box sx={{display: 'flex'}}>
      <Box onClick={() => prevWeek()} sx={{cursor: 'pointer'}}>
        <ArrowBackIosIcon sx={{fontSize: '0.8rem'}} />
      </Box>

      <Typography variant="tableHeaderText" ml="0.5em" mr="0.9em">
        {item}
      </Typography>

      <Box onClick={() => nextWeek()} sx={{cursor: 'pointer'}}>
        <ArrowForwardIosIcon sx={{fontSize: '0.8rem'}} />
      </Box>
    </Box>
  );

  const renderSearch = () => (
    <SearchInput
      placeholder={searchPlaceholder}
      variant="outlined"
      label="Search"
      onValueChanged={(searchValue) =>
        getSearchValue && getSearchValue(searchValue)
      }
      containerStyle={{
        background: '#fff',
        width: '90%',
      }}
    />
  );

  const renderDefault = () => {
    const {t} = useTranslation();
    return <Typography variant="subtitle2">{t(item)}</Typography>;
  };

  if (scheduleType === 'date') {
    return renderDateContols();
  }

  if (scheduleType === 'people') {
    return renderSearch();
  }

  return renderDefault();
};
