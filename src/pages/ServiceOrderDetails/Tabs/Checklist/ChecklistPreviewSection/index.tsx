import {Box, SxProps, Theme, Typography} from '@mui/material';
import {CheckList, CheckListComponentView} from 'models/checklist';
import useTheme from '@mui/material/styles/useTheme';
import {ChecklistComponent} from '../ChecklistComponent';

interface Props {
  checklist: CheckList;
  sx?: SxProps<Theme>;
  isEditing?: boolean;
  onChecklistChange?: (
    newComponent: CheckListComponentView,
    componentIndex: number,
  ) => void;
}

export const ChecklistPreviewSection = ({
  checklist,
  onChecklistChange,
  isEditing = false,
  sx = {},
}: Props) => {
  const theme = useTheme();

  return (
    <Box
      sx={{overflowY: 'auto', ml: 3, ...sx}}
      flex={1}
      px={3}
      py={3}
      bgcolor={theme.palette.inputBackground.main}>
      <Box
        px={2.5}
        pb={2}
        bgcolor="white"
        display="flex"
        flexDirection="column">
        <Typography
          variant="h5"
          color={theme.palette.primary.dark}
          fontSize="31px"
          py={2}>
          {checklist.name ?? ''}
        </Typography>

        <Box display="flex" flexDirection="column" rowGap={3}>
          {checklist.components?.map((component, index) => (
            <ChecklistComponent
              disabled={!isEditing}
              onChange={(newComp) => onChecklistChange?.(newComp, index)}
              key={component.id}
              component={component}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
