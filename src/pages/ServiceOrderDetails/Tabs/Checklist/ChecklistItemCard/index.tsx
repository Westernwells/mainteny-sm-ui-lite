import {Box, Checkbox, SxProps, Typography, Theme} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import {PageCard} from 'components/PageCard';

import {CheckList} from 'models/checklist';
import {useTranslation} from 'react-i18next';
import {formatDate} from 'utils/datetime';

interface Props {
  containerStyles?: SxProps<Theme>;
  data: CheckList;
  checked?: boolean;
  onChecked: (checklist: CheckList) => void;
  onClick: (selectedChecklist: CheckList) => void;
  selected?: boolean;
}

export const ChecklistItemCard = ({
  data,
  onChecked,
  onClick,
  containerStyles = {},
  checked = false,
  selected = false,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <PageCard
      onClick={() => onClick(data)}
      containerStyles={{
        cursor: 'pointer',
        borderColor: selected ? theme.palette.primary.mainLight : 'transparent',
        borderWidth: 1,
        borderStyle: 'solid',
        ...containerStyles,
      }}
      customHeader={
        <Box
          onClick={() => onChecked(data)}
          display="flex"
          sx={{cursor: 'pointer'}}
          alignItems="center"
          gap={1}>
          <Checkbox
            checked={checked}
            size="medium"
            sx={{
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              },
              padding: 0,
            }}
          />
          <Typography fontWeight="bold" fontSize="16px" flex={1}>
            {data.name}
          </Typography>
        </Box>
      }
      contentContainerStyles={{
        display: 'flex',
        flex: 'wrap',
      }}>
      <Box flex={1} display="flex" flexDirection="column">
        <Box display="flex" justifyContent="space-between">
          <Typography fontSize="14px" sx={{color: '#828DA3'}}>
            {t('Created')}
          </Typography>
          <Typography fontSize="14px" fontWeight="bold">
            {formatDate(data.meta.createdAt)}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography fontSize="14px" sx={{color: '#828DA3'}}>
            {t('# of questions')}
          </Typography>
          <Typography fontSize="14px" fontWeight="bold">
            {data.components.length}
          </Typography>
        </Box>
      </Box>
    </PageCard>
  );
};
