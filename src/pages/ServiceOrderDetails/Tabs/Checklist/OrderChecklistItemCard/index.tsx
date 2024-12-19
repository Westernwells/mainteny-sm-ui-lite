import {Delete, Edit} from '@mui/icons-material';
import {Box, Chip, Skeleton, SxProps, Theme, Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import {Avatar} from 'components/Avatar';
import {PageCard} from 'components/PageCard';
import {ThreeDotMenu} from 'components/ThreeDotMenu';

import {ServiceOrderCheckListView} from 'models/checklist';
import {ChecklistStatus} from 'models/service-order';
import {UserAccount} from 'models/user';
import {useTranslation} from 'react-i18next';
import {formatDate} from 'utils/datetime';
import {getUserFullName} from 'utils/utils';
import {useGetTechniciansByEmployeeId} from 'hooks/reactQuery/useTechnician';

interface Props {
  containerStyles?: SxProps<Theme>;
  data: ServiceOrderCheckListView;

  onClick: (selectedChecklist: ServiceOrderCheckListView) => void;
  onDelete: (selectedChecklist: ServiceOrderCheckListView) => void;
  onEdit: (selectedChecklist: ServiceOrderCheckListView) => void;
  selected?: boolean;
  technician?: UserAccount;
  disabled: boolean;
}

export const OrderChecklistItemCard = ({
  data,
  onClick,
  technician,
  onDelete,
  onEdit,
  containerStyles = {},
  selected = false,
  disabled = false,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const {data: fetchedTechnician, isLoading} = useGetTechniciansByEmployeeId(
    !technician ? data.technicianId : undefined,
  );

  const technicianToDisplay = fetchedTechnician?.userAccount || technician;

  const isCompleted = data.additionalInfo.status === ChecklistStatus.COMPLETED;

  const renderChip = () => {
    if (isCompleted) {
      return (
        <Chip
          sx={{
            background: '#4CAF5026',
            '& .MuiChip-label': {
              color: theme.palette.success.dark,
            },
          }}
          size="small"
          label={t('Completed')}
        />
      );
    }

    return (
      <Chip
        sx={{
          background: '#8F9BB326',
          '& .MuiChip-label': {
            color: theme.palette.primary.main,
          },
        }}
        size="small"
        label={t('Incomplete')}
      />
    );
  };

  const renderTechnician = () => {
    if (isLoading) return <Skeleton variant="text" width={124} height={42} />;
    if (technicianToDisplay)
      return (
        <>
          <Avatar
            userAccount={technicianToDisplay}
            sx={{mr: 1}}
            removeNameText
          />

          <Typography fontSize="14px" fontWeight="bold">
            {getUserFullName(technicianToDisplay)}
          </Typography>
        </>
      );

    return '-';
  };

  return (
    <PageCard
      onClick={() => onClick(data)}
      disabled={disabled}
      containerStyles={{
        cursor: 'pointer',
        borderColor: selected ? theme.palette.primary.mainLight : 'transparent',
        borderWidth: 1,
        borderStyle: 'solid',
        ...containerStyles,
      }}
      customHeader={
        <Box
          display="flex"
          sx={{cursor: 'pointer'}}
          alignItems="center"
          gap={1}>
          <Typography fontWeight="bold" fontSize="16px" flex={1}>
            {data.checkList.name}
          </Typography>
          <ThreeDotMenu
            disabled={disabled}
            actions={[
              {
                label: t('Edit'),
                onClick: () => {
                  onEdit(data);
                },

                icon: <Edit />,
              },
              {
                label: t('Delete'),
                onClick: () => {
                  onDelete(data);
                },
                icon: <Delete />,
              },
            ]}
          />
        </Box>
      }
      contentContainerStyles={{
        display: 'flex',
        flex: 'wrap',
      }}>
      <Box flex={1} display="flex" flexDirection="column">
        <Box mb={1.5} display="flex" justifyContent="space-between">
          <Typography fontSize="14px" sx={{color: '#828DA3'}}>
            {t('Status')}
          </Typography>
          {renderChip()}
        </Box>
        {isCompleted && (
          <Box mb={1} display="flex" justifyContent="space-between">
            <Typography fontSize="14px" sx={{color: '#828DA3'}}>
              {t('Date')}
            </Typography>
            <Typography fontSize="14px" fontWeight="bold">
              {formatDate(data.additionalInfo.completedAt)}
            </Typography>
          </Box>
        )}
        <Box display="flex" justifyContent="space-between">
          <Typography fontSize="14px" sx={{color: '#828DA3'}}>
            {t('Technician')}
          </Typography>
          <Box display="flex" alignItems="center">
            {renderTechnician()}
          </Box>
        </Box>
      </Box>
    </PageCard>
  );
};
