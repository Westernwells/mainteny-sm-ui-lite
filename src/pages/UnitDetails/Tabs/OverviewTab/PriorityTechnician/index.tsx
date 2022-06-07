import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {DataGridLayout} from 'components/DataGridLayout';
import {useCallback, useEffect, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {useFormik} from 'formik';
import {MaintainerView} from 'models/technician';
import {Confirm} from 'components/Confirm';
import * as Yup from 'yup';
import {
  useElevatorMaintainers,
  useUpdateElevatorTechnician,
} from 'hooks/reactQuery/useElevator';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {PriorityTechnicianFormModel} from 'models/unitForm';
import {columns, makeRows} from './PriorityTechnicianDataGridProps';
import {PriorityTechnicianForm} from './PriorityTechnicianForm';

interface Props {
  containerStyles?: {[key: string]: any};
  elevatorId?: string;
}

enum DialogTitle {
  ADD_TECHNICIAN = 'Add Technician',
  EDIT_TECHNICIAN = 'Edit Technician',
}

const validationSchema = Yup.object().shape({
  technicianId: Yup.string().nullable().required('Technician is required'),
  priority: Yup.string().nullable().required('Priority is required'),
});

export const PriorityTechnician = ({containerStyles, elevatorId}: Props) => {
  const theme = useTheme();
  const formik = useFormik<PriorityTechnicianFormModel>({
    initialValues: {
      technicianId: '',
      priority: 1,
    },
    onSubmit: () => {},
    validationSchema,
  });
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTechnician, setActiveTechnician] = useState<MaintainerView>();
  const [dialogTitle, setDialogTitle] = useState('');
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const {data: maintainers = []} = useElevatorMaintainers(elevatorId!);
  const {mutateAsync: updateTechnician, isLoading: isEditing} =
    useUpdateElevatorTechnician('Technicians updated successfully');

  useEffect(() => {
    setRows(makeRows(!showAll ? maintainers.slice(0, 3) : maintainers));
  }, [maintainers]);

  const onEditButtonClicked = (item: MaintainerView) => {
    setDialogTitle(DialogTitle.EDIT_TECHNICIAN);
    formik.setFieldValue('technicianId', item.technician.id);
    setActiveTechnician(item);
    setOpenDialog(true);
  };

  const onSave = async () => {
    let body = {};

    maintainers.forEach((item) => {
      body = {
        ...body,
        [item.technician.id]: item.weight,
      };
    });
    await updateTechnician({
      body: {
        ...body,
        [formik.values.technicianId!]: formik.values.priority,
      },
      elevatorId: elevatorId!,
    });

    setOpenDialog(false);
  };

  const onDelete = async () => {
    let body = {};
    maintainers
      .filter(
        (maintainer) =>
          maintainer.technician.id !== activeTechnician?.technician.id,
      )
      .forEach((item) => {
        body = {
          ...body,
          [item.technician.id]: item.weight,
        };
      });

    await updateTechnician({
      body,
      elevatorId: elevatorId!,
    });

    setOpenCancelConfirm(false);
  };

  const getEditableTechnician = (item: MaintainerView) => {
    onEditButtonClicked(item);
  };

  const getDeletableTechnician = (item: MaintainerView) => {
    setActiveTechnician(item);
    setOpenCancelConfirm(true);
  };

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      showHeaderBackground
      header={<Typography variant="subtitle1">Priority Technicians</Typography>}
      handleAction={() => {
        setActiveTechnician(undefined);
        setDialogTitle(DialogTitle.ADD_TECHNICIAN);
        formik.setValues({technicianId: '', priority: 0});
        setOpenDialog(true);
      }}
      headerActionIcon={<Typography color="info.main">+ Add</Typography>}>
      <DataGridLayout
        fullHeight={false}
        height={200}
        hideFooter
        rows={rows}
        columns={useCallback(
          () => columns(getEditableTechnician, getDeletableTechnician),
          [],
        )()}
        containerStyle={{
          borderBottom: 'none',
        }}
      />
      {maintainers.length > 3 ? (
        <Box
          sx={{textAlign: 'center', cursor: 'pointer'}}
          onClick={() => setShowAll(!showAll)}>
          <Typography variant="caption" color={theme.palette.info.main}>
            {showAll ? 'see less' : 'see more'}
          </Typography>
        </Box>
      ) : null}

      <Dialog
        title={dialogTitle}
        isSaving={isEditing}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onCancel={() => setOpenDialog(false)}
        onSave={onSave}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}>
        <PriorityTechnicianForm
          disableAutoComplete={dialogTitle === DialogTitle.EDIT_TECHNICIAN}
          formik={formik}
          activeTechnician={activeTechnician}
        />
      </Dialog>

      <Confirm
        open={openCancelConfirm}
        onConfirm={() => onDelete()}
        onClose={() => setOpenCancelConfirm(false)}
        title="Confirm"
        content="Do you want to delete this note?"
      />
    </InfoCard>
  );
};
