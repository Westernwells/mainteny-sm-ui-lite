import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {DataGridLayout} from 'components/DataGridLayout';
import {useCallback, useEffect, useRef, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {useFormik} from 'formik';
import {Confirm} from 'components/Confirm';
import * as Yup from 'yup';
import {useUpdateElevatorTechnician} from 'hooks/reactQuery/useElevator';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {EmptySection} from 'components/EmptySection';
import {getDataGridHeight} from 'utils/utils';
import {ElevatorAssignmentSimpleView} from 'models/elevator';
import {PriorityTechnicianFormModel} from 'models/unitForm';
import {columns, makeRows} from './PriorityTechnicianDataGridProps';
import {PriorityTechnicianForm} from './PriorityTechnicianForm';

interface Props {
  containerStyles?: {[key: string]: any};
  elevatorId?: string;
  maintainers?: ElevatorAssignmentSimpleView[];
}

enum DialogTitle {
  ADD_TECHNICIAN = 'Add Technician',
  EDIT_TECHNICIAN = 'Edit Technician',
}

const validationSchema = Yup.object().shape({
  technicianId: Yup.string().nullable().required('Technician is required'),
  priority: Yup.string().nullable().required('Priority is required'),
});

export const PriorityTechnician = ({
  containerStyles,
  elevatorId,
  maintainers = [],
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const formik = useFormik<PriorityTechnicianFormModel>({
    initialValues: {
      technicianId: '',
      priority: 1,
    },
    onSubmit: () => {},
    validationSchema,
  });
  let totalTechnicianRef = useRef(0).current;
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTechnician, setActiveTechnician] =
    useState<ElevatorAssignmentSimpleView>();
  const [dialogTitle, setDialogTitle] = useState('');
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const {mutateAsync: updateTechnician, isLoading: isEditing} =
    useUpdateElevatorTechnician('Technicians updated successfully');

  totalTechnicianRef = totalTechnicianRef || maintainers.length;

  useEffect(() => {
    setRows(makeRows(!showAll ? maintainers.slice(0, 3) : maintainers));
  }, [maintainers, showAll]);

  const onEditButtonClicked = (item: ElevatorAssignmentSimpleView) => {
    setDialogTitle(DialogTitle.EDIT_TECHNICIAN);
    formik.setFieldValue('technicianId', item.technician.id);
    formik.setFieldValue('priority', item.weight);
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

  const getEditableTechnician = (item: ElevatorAssignmentSimpleView) => {
    onEditButtonClicked(item);
  };

  const getDeletableTechnician = (item: ElevatorAssignmentSimpleView) => {
    setActiveTechnician(item);
    setOpenCancelConfirm(true);
  };

  const onAddButtonClicked = () => {
    setActiveTechnician(undefined);
    setDialogTitle(DialogTitle.ADD_TECHNICIAN);
    formik.setValues({technicianId: '', priority: 0});
    setOpenDialog(true);
  };

  const renderNoRowsSection = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
      <EmptySection
        illustration="clipboard"
        size="tiny"
        containerStyle={{m: '1em 0', width: '60%'}}
        label="No priority technicians have been added yet!"
      />
    </Box>
  );

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      showHeaderBackground
      header={
        <Typography variant="subtitle1">{t('Priority Technicians')}</Typography>
      }
      handleAction={() => onAddButtonClicked()}
      headerActionIcon={
        <Typography color="info.main">{`+ ${t('Add')}`}</Typography>
      }>
      {!totalTechnicianRef ? (
        renderNoRowsSection()
      ) : (
        <DataGridLayout
          fullHeight={false}
          height={getDataGridHeight(rows.length, showAll ? rows.length : 3)}
          hideFooter
          rows={rows}
          isWidget
          columns={useCallback(
            () => columns(getEditableTechnician, getDeletableTechnician),
            [],
          )()}
          containerStyle={{
            borderBottom: 'none',
          }}
        />
      )}
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
        content="Do you want to delete this technician?"
      />
    </InfoCard>
  );
};
