import {Box, useTheme} from '@mui/system';
import {Chip} from '@mui/material';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {OptionWithTranslationKey} from 'models/filter';

type Props = {
  selected: string[];
  options: OptionWithTranslationKey[];
  statistics?: Record<string, number>;
  onChange: (value: string) => void;
};

const QuickFilter = ({selected, options, statistics, onChange}: Props) => {
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
        const isSelected =
          selected.length === 0
            ? option.value === 'ALL'
            : selected.includes(option.value);

        const chipNumber = statistics?.[option.value] ?? null;
        return (
          <Box
            key={`quick-filter-option-${option.value}`}
            component="button"
            sx={{
              border: 'none',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              fontSize: '14px',
              padding: '4px 12px ',
              height: '100%',
              color: '#828DA3',

              '&:hover': {
                backgroundColor: '#FFFFFF',
              },

              ...(isSelected && {
                color: theme.palette.primary.dark,
                backgroundColor: '#FFFFFF',
              }),
            }}
            onClick={() => onChange(option.value)}
            gap={0.5}>
            <Typography
              variant="subtitle2"
              sx={{
                display: 'flex',
                lineHeight: '22.4px',
                cursor: 'pointer',
              }}>
              {t(option.labelKey)}
            </Typography>
            {isSelected && chipNumber && (
              <Chip
                sx={{height: '25px'}}
                label={chipNumber}
                variant="outlined"
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default QuickFilter;
