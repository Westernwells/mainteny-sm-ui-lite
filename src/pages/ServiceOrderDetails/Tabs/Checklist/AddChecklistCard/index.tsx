import {
  Box,
  Grid,
  IconButton,
  MenuItem,
  Select,
  styled,
  Typography,
} from '@mui/material';
import {PageCard} from 'components/PageCard';
import useTheme from '@mui/material/styles/useTheme';

import {useTranslation} from 'react-i18next';
import {ServiceOrderCheckListView} from 'models/checklist';
import {ChecklistStatus, ServiceOrderView} from 'models/service-order';
import {useMemo, useState} from 'react';
import {Add} from '@mui/icons-material';
import {Confirm} from 'components/Confirm';
import {useDisassociateChecklistToServiceOrder} from 'hooks/reactQuery/useChecklists';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {theme as MuiTheme} from 'theme';
import {UserAccount} from 'models/user';
import {OrderChecklistItemCard} from '../OrderChecklistItemCard';
import {NoChecklist} from '../NoChecklist';

interface Props {
  onAddPress: () => void;
  checklists?: ServiceOrderCheckListView[];
  selectedChecklist?: ServiceOrderCheckListView;
  onSelect: (newChecklist: ServiceOrderCheckListView) => void;
  serviceOrder: ServiceOrderView;
  onEditPress: (newChecklist: ServiceOrderCheckListView) => void;
  isEditing: boolean;
}

const StyledExpandIcon = styled(ExpandMoreIcon)({
  fill: MuiTheme.palette.primary.main,
});

const ALL_CHECKLIST_FILTER_OPTIONS = [
  {
    label: 'All checklists',
    value: 'ALL',
  },
  {
    label: 'Completed',
    value: 'COMPLETED',
  },
  {
    label: 'Incomplete',
    value: 'IN_COMPLETE',
  },
];

export const AddChecklistCard = ({
  onAddPress,
  checklists,
  selectedChecklist,
  onSelect,
  serviceOrder,
  onEditPress,
  isEditing = false,
}: Props) => {
  const theme = useTheme();
  const [checklistFilter, setChecklistFilter] = useState('ALL');
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState<{
    isOpen?: boolean;
    checklist?: ServiceOrderCheckListView;
  }>({
    isOpen: false,
  });
  const {mutate: disassociateMultiChecklist} =
    useDisassociateChecklistToServiceOrder('Checklist deleted successfully!');
  const {t} = useTranslation();
  const technicianMap = useMemo(() => {
    const map = serviceOrder.additionalInfo.candidateTechnicians?.reduce(
      (acc, item) => {
        acc[item.id] = item.userAccount;
        return acc;
      },
      {} as {[key: string]: UserAccount},
    );

    return serviceOrder.schedules.reduce((acc, item) => {
      acc[item.technician.id] = item.technician.userAccount;

      return acc;
    }, map as {[key: string]: UserAccount});
  }, [serviceOrder]);

  const filteredChecklists = useMemo(() => {
    if (checklistFilter === 'COMPLETED') {
      return checklists?.filter(
        (item) => item.additionalInfo.status === ChecklistStatus.COMPLETED,
      );
    }

    if (checklistFilter === 'IN_COMPLETE') {
      return checklists?.filter(
        (item) => item.additionalInfo.status !== ChecklistStatus.COMPLETED,
      );
    }

    return checklists;
  }, [checklists, checklistFilter]);

  const scheduled = serviceOrder.schedules ?? [];
  const candidates = serviceOrder.additionalInfo.candidateTechnicians ?? [];

  const technicianNotAssigned =
    scheduled.length === 0 && candidates.length === 0;

  return (
    <>
      <PageCard
        customHeader={
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              flex={1}>
              <Typography sx={{fontWeight: '600', color: '#828DA3'}}>
                {t('Checklists').toUpperCase()}
              </Typography>
              {!!checklists?.length && (
                <Select
                  size="small"
                  required
                  notched
                  onChange={(e) => {
                    setChecklistFilter(e.target.value);
                  }}
                  value={checklistFilter}
                  sx={{
                    background: 'transparent',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '& [aria-labelledby="demo-simple-select-label"]': {
                      fontWeight: 600,
                    },
                  }}
                  IconComponent={StyledExpandIcon}>
                  {ALL_CHECKLIST_FILTER_OPTIONS.map((type) => (
                    <MenuItem value={type.value} key={type.value}>
                      {t(type.label)}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </Box>
            {!!checklists?.length && (
              <IconButton onClick={onAddPress} sx={{p: 0.5}}>
                <Add htmlColor={theme.palette.primary.main} />
              </IconButton>
            )}
          </Box>
        }
        contentContainerStyles={{
          display: 'flex',
          flex: 'wrap',
          justifyContent: 'space-between',
          pb: '0.5em !important',
        }}>
        <Grid
          sx={{
            minHeight: '60px',
          }}
          container>
          <Grid pb={2} item sm={12} md={12}>
            {!checklists?.length && (
              <NoChecklist
                disabled={technicianNotAssigned}
                onAddPress={onAddPress}
              />
            )}
            {filteredChecklists?.map((item, index) => {
              const key = item.checkListId + item.technicianId;

              return (
                <OrderChecklistItemCard
                  key={key}
                  containerStyles={index === 0 ? {mt: 0, mb: 1.5} : {my: 1.5}}
                  selected={selectedChecklist?.checkListId === item.checkListId}
                  onClick={(newSelectedChecklist) => {
                    onSelect?.(newSelectedChecklist);
                  }}
                  disabled={isEditing}
                  onEdit={onEditPress}
                  onDelete={(newSelectedChecklist) => {
                    setConfirmDeleteDialog({
                      isOpen: true,
                      checklist: newSelectedChecklist,
                    });
                  }}
                  technician={technicianMap[item.technicianId]}
                  data={item}
                />
              );
            })}
          </Grid>
        </Grid>
      </PageCard>
      <Confirm
        open={confirmDeleteDialog.isOpen}
        onConfirm={() => {
          disassociateMultiChecklist({
            params: {serviceOrder: serviceOrder.id},
            body: {
              checkListId: confirmDeleteDialog.checklist?.checkListId!,
              technicianId: confirmDeleteDialog.checklist?.technicianId!,
            },
          });
          setConfirmDeleteDialog({...confirmDeleteDialog, isOpen: false});
        }}
        onClose={() =>
          setConfirmDeleteDialog({...confirmDeleteDialog, isOpen: false})
        }
        title="Delete Checklist"
        content="You are about to delete this checklist."
        secondContent=""
        helperText="Are you sure about it?"
      />
    </>
  );
};
