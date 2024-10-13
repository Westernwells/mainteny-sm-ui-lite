import {Box, useTheme} from '@mui/system';
import {Button, Chip} from '@mui/material';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {OptionWithTranslationKey} from 'models/filter';
import capitalize from 'lodash/capitalize';

type Props = {
  selected: string | null;
  options: OptionWithTranslationKey[];
  chipNumber?: number;
  onChange: (value: string | null) => void;
};

const QuickFilter = ({selected, options, chipNumber, onChange}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <Box
      gap={0.5}
      sx={{
        padding: '2px',
        backgroundColor: theme.palette.inputBackground.main,
        display: 'flex',
        alignItems: 'center',
        borderRadius: '4px',
        height: '40px',
        width: 'fit-content',
      }}>
      {options.map((option) => {
        if (selected === option.value)
          return (
            <Box
              key={`quick-filter--selected-option-${option.value}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                fontSize: '14px',
                padding: '4px 12px ',
                backgroundColor: '#FFFFFF',
                height: '100%',
              }}
              gap={0.5}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: 'flex',
                  lineHeight: '22.4px',
                  cursor: 'pointer',
                }}>
                {capitalize(t(option.labelKey))}
              </Typography>
              {chipNumber && (
                <Chip
                  sx={{height: '25px'}}
                  label={chipNumber}
                  variant="outlined"
                />
              )}
            </Box>
          );
        return (
          <Button
            key={`quick-filter-option-${option.value}`}
            sx={{
              padding: '4px 12px ',
              textTransform: 'capitalized',
              color: '#828DA3',
            }}
            size="large"
            onClick={() => onChange(option.value)}>
            <Typography variant="subtitle2">
              {capitalize(t(option.labelKey))}
            </Typography>
          </Button>
        );
      })}
    </Box>
  );
};

export default QuickFilter;
