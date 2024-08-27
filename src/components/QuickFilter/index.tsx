import {Box, useTheme} from '@mui/system';
import {Button} from '@mui/material';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {Option} from '../../models/filter';

type Props = {
  selected: string | null;
  options: Option[];
  onChange: (value: string | null) => void;
};

const QuickFilter = ({selected, options, onChange}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <Box
      gap={1}
      sx={{
        padding: '4px',
        backgroundColor: theme.palette.grey[300],
        display: 'flex',
        alignItems: 'center',
        borderRadius: '4px',
      }}>
      {options.map((option) => {
        if (selected === option.value)
          return (
            <Typography
              sx={{
                display: 'flex',
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '3px',
                fontSize: '14px',
                lineHeight: '22.4px',
                padding: '8px 24px ',
              }}>
              {t(option.labelKey)}
            </Typography>
          );
        return (
          <Button
            sx={{
              padding: '8px 24px ',
            }}
            size="large"
            onChange={() => onChange(option.value)}>
            {t(option.labelKey)}
          </Button>
        );
      })}
    </Box>
  );
};

export default QuickFilter;
