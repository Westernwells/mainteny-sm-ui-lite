import {Box, Checkbox, Radio, TextField, Typography} from '@mui/material';
import {CheckListComponentType, CheckListComponentView} from 'models/checklist';
import useTheme from '@mui/material/styles/useTheme';

interface ComponentHeaderProps {
  component: CheckListComponentView;
}
interface ComponentProps {
  component: CheckListComponentView;
  disabled?: boolean;
  onChange: (newComponent: CheckListComponentView) => void;
}

export const MultiChoiceComponent = ({
  component,
  onChange,
  disabled = false,
}: ComponentProps) => (
  <Box display="flex" flexDirection="column" rowGap={1.5}>
    <Typography variant="h6">{component.subject}</Typography>
    {component.additionalInfo.options.map((option, optionIndex) => (
      <Box key={optionIndex} display="flex" ml={-1}>
        <Radio
          size="medium"
          disabled={disabled}
          value={optionIndex}
          onChange={(e) => {
            const componentCloned = {...component};

            if (!componentCloned.additionalInfo.answer) {
              componentCloned.additionalInfo.answer = [];
            }

            componentCloned.additionalInfo.answer[0] = e.target.value;

            onChange(componentCloned);
          }}
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

export const CheckboxComponent = ({
  component,
  onChange,
  disabled = false,
}: ComponentProps) => (
  <Box display="flex" ml={-1}>
    <Checkbox
      checked={!!(component.additionalInfo?.answer?.[0] === 'y')}
      size="medium"
      onChange={(e) => {
        const componentCloned = {...component};
        if (!componentCloned.additionalInfo.answer) {
          componentCloned.additionalInfo.answer = [];
        }

        if (e.target.checked) {
          componentCloned.additionalInfo.answer[0] = 'y';
        } else {
          componentCloned.additionalInfo.answer = [];
        }

        onChange(componentCloned);
      }}
      disabled={disabled}
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

export const HeaderComponent = ({component}: ComponentHeaderProps) => (
  <Typography variant="h5">{component.subject}</Typography>
);

export const TextComponent = ({
  component,
  onChange,
  disabled,
}: ComponentProps) => {
  const theme = useTheme();

  return (
    <Box display="flex" flexDirection="column" rowGap={2}>
      <Typography variant="h6">{component.subject}</Typography>

      <TextField
        id="outlined-multiline-flexible"
        multiline
        disabled={disabled}
        minRows={6}
        sx={{
          color: theme.palette.primary.main,
          '& .MuiOutlinedInput-input': {
            color: theme.palette.primary.main,
            WebkitTextFillColor: theme.palette.primary.main,
          },
          '& .Mui-disabled': {
            color: theme.palette.primary.main,
            WebkitTextFillColor: theme.palette.primary.main,
          },
        }}
        onChange={(e) => {
          const componentCloned = {...component};
          if (!componentCloned.additionalInfo.answer) {
            componentCloned.additionalInfo.answer = [];
          }

          componentCloned.additionalInfo.note = e.target.value;

          onChange(componentCloned);
        }}
        value={component.additionalInfo.note}
        maxRows={6}
      />
    </Box>
  );
};

export const ChecklistComponent = ({
  component,
  onChange,
  disabled = false,
}: ComponentProps) =>
  component.type === CheckListComponentType.SINGLE_CHECK ? (
    <MultiChoiceComponent
      onChange={onChange}
      disabled={disabled}
      component={component}
    />
  ) : component.type === CheckListComponentType.YES_NO ? (
    <CheckboxComponent
      onChange={onChange}
      disabled={disabled}
      component={component}
    />
  ) : component.type === CheckListComponentType.HEAD ? (
    <HeaderComponent component={component} />
  ) : component.type === CheckListComponentType.TEXT ? (
    <TextComponent
      onChange={onChange}
      disabled={disabled}
      component={component}
    />
  ) : null;
