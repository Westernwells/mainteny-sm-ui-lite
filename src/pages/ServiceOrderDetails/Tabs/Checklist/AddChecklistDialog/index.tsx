import {Dialog} from 'components/Dialog';

import {CreateEditMode} from 'models/misc';
import {Alert, Box, Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';
import {useState} from 'react';
import {CheckList, ServiceOrderCheckListView} from 'models/checklist';
import {ServiceOrderView} from 'models/service-order';
import {useAssociateMultiChecklistToServiceOrder} from 'hooks/reactQuery/useChecklists';
import {FindChecklistSection} from '../FindChecklistSection';
import {ChecklistPreviewSection} from '../ChecklistPreviewSection';

interface Props {
  formType?: CreateEditMode;
  isOpen?: boolean;
  onClose?: () => void;
  serviceOrder: ServiceOrderView;
  serviceOrderCheckLists?: ServiceOrderCheckListView[];
}

const AddChecklistDialog = ({
  onClose,
  serviceOrder,
  serviceOrderCheckLists,
  isOpen = false,
  formType = 'create',
}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const [checkedChecklists, setCheckedChecklists] = useState<CheckList[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<CheckList>();
  const {mutate: associateMultiChecklist, isLoading} =
    useAssociateMultiChecklistToServiceOrder(
      'Checklist associated successfully!',
    );

  const handleCheckedChecklistChange = (newChecklist: CheckList) => {
    const checkedChecklistsClone = [...checkedChecklists];
    const foundIndex = checkedChecklistsClone.findIndex(
      (item) => item.id === newChecklist.id,
    );

    if (foundIndex !== -1) {
      checkedChecklistsClone.splice(foundIndex, 1);
    } else {
      checkedChecklistsClone.push(newChecklist);
    }

    setCheckedChecklists(checkedChecklistsClone);
  };

  const handleChecklistSelect = (newChecklist: CheckList) => {
    setSelectedChecklist(newChecklist);
  };

  const handleSave = async () => {
    const body = checkedChecklists
      .map((checklist) =>
        serviceOrder.schedules.map((schedule) => ({
          technicianId: schedule.technician.id,
          checkListId: checklist.id,
        })),
      )
      .flat();

    associateMultiChecklist(
      {
        params: {
          serviceOrder: serviceOrder.id,
        },
        body,
      },
      {
        onSuccess: () => {
          setCheckedChecklists([]);
          setSelectedChecklist(undefined);
          onClose?.();
        },
      },
    );
  };

  return (
    <Dialog
      title={formType === 'edit' ? 'Edit checklist(s)' : 'Add checklist(s)'}
      saveButtonText={
        checkedChecklists.length
          ? t(`Add {{noOfChecklists}} checklists`, {
              noOfChecklists: checkedChecklists.length,
            })
          : 'Add checklist'
      }
      disableSaveBtn={!checkedChecklists.length}
      isSaving={isLoading}
      onCancel={() => {
        onClose?.();
      }}
      dialogContentTextStyles={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        overflowY: 'hidden',
      }}
      dialogActionsStyles={{
        padding: '0.7em 24px 0.7em 1.5em',
      }}
      onSave={() => {
        handleSave();
      }}
      saveButtonContainerStyles={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
      }}
      dialogContentStyles={{
        marginTop: 0,
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      dialogTitleStyles={{paddingBottom: 0}}
      sx={{
        '& .MuiDialog-paper': {
          height: '95vh',
          maxHeight: 1000,
        },
      }}
      dialogProps={{
        maxWidth: 'lg',
        open: isOpen,
      }}>
      <Alert severity="info">
        <Typography color={theme.palette.info.infoAlert}>
          {t(
            'Select checklists which will be available to all technicians on the job.',
          )}
        </Typography>
      </Alert>
      <Box flex={1} mt={3} sx={{overflowY: 'hidden'}} display="flex">
        <FindChecklistSection
          selectedChecklist={selectedChecklist}
          serviceOrderCheckLists={serviceOrderCheckLists}
          onChecklistSelect={handleChecklistSelect}
          onCheckedChecklistChange={handleCheckedChecklistChange}
          checkedChecklists={checkedChecklists}
        />
        {selectedChecklist && (
          <ChecklistPreviewSection checklist={selectedChecklist} />
        )}
      </Box>
    </Dialog>
  );
};

export default AddChecklistDialog;
