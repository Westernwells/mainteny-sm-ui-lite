import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useFormik} from 'formik';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {Progress} from 'components/Progress';
import {NoRowsEmptySection} from 'components/DataGrid/NoRowsEmptySection';
import {styles} from 'components/DataGrid/style';
import {Button} from 'components/Button';
import {useQueryCustomerElevator} from 'hooks/reactQuery/useElevator';
import {useFormatDate} from 'hooks/useFormatDate';
import {ElevatorView} from 'models/elevator';
import {FormatDate} from 'models/misc';
import {createEmptyResource} from 'utils/paging';
import {useAttachElevatorsToContract} from 'hooks/reactQuery/useContract';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'unit number',
    flex: 1,
  }),
  getColumnProps({
    field: 'model',
    headerName: 'model',
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
];

export const makeRows = (
  elevators: ElevatorView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  elevators
    ? elevators.map((item) => ({
        id: item.id,
        number: item.externalId,
        model: item.model,
        customer: item.propertyOwner.name,
        address: item.address.fullName,
        lastVisit: formatDate(item.lastVisitDate),
        nextVisit: formatDate(item.nextVisitDate),
        elevator: item,
      }))
    : [];

export const AddUnitsDataGrid = ({
  propertyOwnerId,
  onConfirm,
  selectedElevators,
}: {
  propertyOwnerId: string;
  onConfirm: () => void;
  selectedElevators?: string[];
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {id: contractId = ''} = useParams();
  const formatDate = useFormatDate();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<GridRowsProp>([]);

  const {
    data: elevatorResource = createEmptyResource<ElevatorView>(500),
    isIdle,
    isLoading,
    isFetching,
  } = useQueryCustomerElevator(
    {query: search, pageIndex: 0, pageSize: 500},
    propertyOwnerId,
    {keepPreviousData: true},
  );
  const {mutateAsync: updateContract} =
    useAttachElevatorsToContract('Contract updated');

  const formik = useFormik<{elevators: string[]}>({
    initialValues: {
      elevators: selectedElevators ?? [],
    },
    onSubmit: (values) =>
      updateContract(
        {
          contractId,
          body: values.elevators,
        },
        {
          onSuccess: () => onConfirm(),
        },
      ),
  });

  useEffect(() => {
    if (elevatorResource.data.length) {
      setRows(makeRows(elevatorResource.data, formatDate));
    } else {
      setRows([]);
    }
  }, [elevatorResource.data]);

  if (isIdle || isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}>
        <Progress height="100%" />
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <SearchInput
          variant="outlined"
          label="Search"
          placeholder="Search by number, model, customer, address etc."
          onValueChanged={(value) => setSearch(value)}
        />
        <Button
          label="Create new unit"
          buttonProps={{
            onClick: () => navigate('/units/new'),
            variant: 'text',
            sx: {
              bgcolor: theme.palette.primary.outlinedHoverBg,
              textTransform: 'none',
            },
            color: 'primary',
            startIcon: <AddIcon />,
          }}
        />
      </Box>
      <Box display="flex" flexGrow={1} sx={styles.scrollBar}>
        <DataGridLayout
          selectionModel={formik.values.elevators}
          disableSelectionOnClick={false}
          isCellClickable={false}
          rows={rows}
          columns={columns}
          scrollToTop={search}
          loading={isFetching}
          checkboxSelection
          onSelectionModelChange={(newSelection) =>
            formik.setFieldValue('elevators', newSelection)
          }
          isRowSelectable={() => true}
          noRowsEmptySection={
            <NoRowsEmptySection
              placeholder="unit"
              action={() => window.open('/units/new', '_blank')}
            />
          }
        />
      </Box>
      <Button
        label="Add units"
        buttonProps={{
          onClick: () => formik.handleSubmit(),
          variant: 'contained',
          sx: {
            textTransform: 'none',
            ml: 'auto',
            mt: '1rem',
          },
          size: 'large',
        }}
      />
    </>
  );
};
