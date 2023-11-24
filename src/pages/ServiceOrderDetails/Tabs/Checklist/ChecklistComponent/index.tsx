import {Box, Checkbox, Radio, Typography} from '@mui/material';
import {CheckListComponentType, CheckListComponentView} from 'models/checklist';

interface ComponentProps {
  component: CheckListComponentView;
}

export const MultiChoiceComponent = ({component}: ComponentProps) => (
  <Box display="flex" flexDirection="column" rowGap={1.5}>
    <Typography variant="h6">{component.subject}</Typography>
    {component.additionalInfo.options.map((option, optionIndex) => (
      <Box key={optionIndex} display="flex" ml={-1}>
        <Radio
          size="medium"
          checked={
            !!(component.additionalInfo?.answer?.[0] === String(optionIndex))
          }
          sx={{
            '&.Mui-checked': {
              color: '#4CAF50',
            },
          }}
        />
        <Typography
          variant="body1"
          py="7px"
          px={1.5}
          flex={1}
          border="1px solid #e4e9f2"
          borderRadius={0.5}
          minHeight={38}>
          {option.text}
        </Typography>
      </Box>
    ))}
  </Box>
);

export const CheckboxComponent = ({component}: ComponentProps) => (
  <Box display="flex" ml={-1}>
    <Checkbox
      checked={!!(component.additionalInfo?.answer?.[0] === 'y')}
      size="medium"
      sx={{
        '&.Mui-checked': {
          color: '#4CAF50',
        },
      }}
    />
    <Typography
      variant="body1"
      py="7px"
      px={1.5}
      flex={1}
      border="1px solid #e4e9f2"
      borderRadius={0.5}
      minHeight={38}>
      {component.subject}
    </Typography>
  </Box>
);

export const HeaderComponent = ({component}: ComponentProps) => (
  <Typography variant="h5">{component.subject}</Typography>
);

export const TextComponent = ({component}: ComponentProps) => (
  <Box display="flex" flexDirection="column" rowGap={2}>
    <Typography variant="h6">{component.subject}</Typography>

    <Typography
      variant="body1"
      p={1.5}
      border="1px solid #e4e9f2"
      borderRadius={0.5}
      minHeight={120}>
      {component.additionalInfo.note}
    </Typography>
  </Box>
);

export const ChecklistComponent = ({component}: ComponentProps) =>
  component.type === CheckListComponentType.SINGLE_CHECK ? (
    <MultiChoiceComponent component={component} />
  ) : component.type === CheckListComponentType.YES_NO ? (
    <CheckboxComponent component={component} />
  ) : component.type === CheckListComponentType.HEAD ? (
    <HeaderComponent component={component} />
  ) : component.type === CheckListComponentType.TEXT ? (
    <TextComponent component={component} />
  ) : null;
