import {Box, Checkbox, Radio, TextField, Typography} from '@mui/material';
import {CheckListComponentType, CheckListComponentView} from 'models/checklist';
import useTheme from '@mui/material/styles/useTheme';
import {ImagePicker} from 'components/ImagePicker';
import {FormEvent} from 'react';
import {fileListToFiles} from 'utils/utils';
import {HorizontalChecklistImageList} from 'components/HorizontalChecklistImageList';
import {FileResourceRecord} from 'models/media';

interface ComponentHeaderProps {
  component: CheckListComponentView;
}
interface ComponentProps {
  component: CheckListComponentView;
  disabled?: boolean;
  onChange: (newComponent: CheckListComponentView) => void;
  onImageChange?: (e: FormEvent<HTMLInputElement>) => void;
  isEditing?: boolean;
  onImageDelete?: (image: FileResourceRecord, index: number) => void;
}

interface ComponentMainProps {
  component: CheckListComponentView;
  disabled?: boolean;
  onChange: (newComponent: CheckListComponentView) => void;
  onImageChange?: (component: CheckListComponentView, files: File[]) => void;
  isEditing?: boolean;
}

export const MultiChoiceComponent = ({
  component,
  onChange,
  onImageChange,

  onImageDelete,

  disabled = false,
  isEditing = false,
}: ComponentProps) => (
  <Box display="flex" flexDirection="column" rowGap={1.5}>
    <Box display="flex" flexDirection="row" alignItems="center">
      <Typography flex={1} variant="h6">
        {component.subject}
      </Typography>
      {isEditing && <ImagePicker onChange={onImageChange} />}
    </Box>
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
    <HorizontalChecklistImageList
      onImageDelete={onImageDelete}
      component={component}
      isEditing={isEditing}
    />
  </Box>
);

export const CheckboxComponent = ({
  component,
  onChange,
  onImageChange,
  onImageDelete,
  isEditing,
  disabled = false,
}: ComponentProps) => (
  <>
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
      {isEditing && <ImagePicker onChange={onImageChange} />}
    </Box>
    <HorizontalChecklistImageList
      onImageDelete={onImageDelete}
      component={component}
      isEditing={isEditing}
    />
  </>
);

export const HeaderComponent = ({component}: ComponentHeaderProps) => (
  <Typography variant="h5">{component.subject}</Typography>
);

export const TextComponent = ({
  component,
  onChange,
  disabled,
  isEditing,
  onImageChange,
  onImageDelete,
}: ComponentProps) => {
  const theme = useTheme();

  return (
    <>
      <Box display="flex" flexDirection="column" rowGap={2}>
        <Box display="flex" flexDirection="row" alignItems="center">
          <Typography flex={1} variant="h6">
            {component.subject}
          </Typography>
          {isEditing && <ImagePicker onChange={onImageChange} />}
        </Box>

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
      <HorizontalChecklistImageList
        onImageDelete={onImageDelete}
        component={component}
        isEditing={isEditing}
      />
    </>
  );
};

export const ChecklistComponent = ({
  component,
  onChange,
  onImageChange,
  disabled = false,
  isEditing = false,
}: ComponentMainProps) => {
  const handleImageChange = async (e: FormEvent<HTMLInputElement>) => {
    const {files} = e.currentTarget;

    onImageChange?.(component, fileListToFiles(files));
  };

  const handleImageDelete = (_image: FileResourceRecord, index: number) => {
    const componentCloned = {...component};

    componentCloned.additionalInfo.pictures?.splice(index, 1);

    onChange(componentCloned);
  };

  switch (component.type) {
    case CheckListComponentType.SINGLE_CHECK:
      return (
        <MultiChoiceComponent
          onChange={onChange}
          onImageChange={handleImageChange}
          onImageDelete={handleImageDelete}
          disabled={disabled}
          component={component}
          isEditing={isEditing}
        />
      );
    case CheckListComponentType.YES_NO:
      return (
        <CheckboxComponent
          onChange={onChange}
          disabled={disabled}
          component={component}
          onImageChange={handleImageChange}
          onImageDelete={handleImageDelete}
          isEditing={isEditing}
        />
      );
    case CheckListComponentType.HEAD:
      return <HeaderComponent component={component} />;
    case CheckListComponentType.TEXT:
      return (
        <TextComponent
          onChange={onChange}
          disabled={disabled}
          component={component}
          onImageChange={handleImageChange}
          onImageDelete={handleImageDelete}
          isEditing={isEditing}
        />
      );
    default:
      return null;
  }
};
