import {EmptySection} from 'components/EmptySection';
import {Button} from 'components/Button';
import AddIcon from '@mui/icons-material/Add';
import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';

export const EmptyContainer = () => {
  const {t} = useTranslation();

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center">
      <EmptySection
        label="No types defined"
        size="tiny"
        subLabel="Create your custom absence and presence types"
        containerStyle={{mb: 0, mt: 1}}
        illustration="calendarClock"
        subLabelProps={{sx: {color: '#828DA3', mt: 1}}}
      />
      <Button
        label="Filter"
        buttonProps={{
          sx: {
            textTransform: 'inherit',
            mt: 2,
          },
          variant: 'outlined',
          color: 'primary',
          size: 'small',
          startIcon: <AddIcon />,
        }}>
        <Typography variant="body1" sx={{textTransform: 'inherit'}}>
          {t('New type')}
        </Typography>
      </Button>
    </Box>
  );
};
