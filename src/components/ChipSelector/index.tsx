import {Box, Chip, Typography} from '@mui/material';
import {OptionWithTranslationKey} from 'models/filter';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@mui/system';
import capitalize from 'lodash/capitalize';

type Props = {
  options: OptionWithTranslationKey[];
  selectedChips: string[];
  headerLabel?: string;
  onChange: (value: string) => void;
};

const ChipSelector = ({
  options,
  selectedChips,
  headerLabel,
  onChange,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const handleClick = (value: string) => () => {
    onChange(value);
  };

  return (
    <Box sx={{display: 'flex'}} flexWrap="wrap" gap={1}>
      {headerLabel && (
        <Typography variant="subtitle2">
          {capitalize(t(headerLabel))}
        </Typography>
      )}

      <Box sx={{display: 'flex'}} flexWrap="wrap" gap={0.75}>
        {options.map((option) => {
          const isSelected = selectedChips.some(
            (selectedValue) => selectedValue === option.value,
          );
          return (
            <Chip
              sx={{
                height: '32px',
                backgroundColor: 'white',
                border: `solid ${theme.palette.grey[200]}  1px`,
                ...(isSelected && {
                  color: '#FFFFFF',
                  backgroundColor: theme.palette.primary.light,
                }),
              }}
              label={t(option.labelKey)}
              onClick={handleClick(option.value)}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default ChipSelector;
