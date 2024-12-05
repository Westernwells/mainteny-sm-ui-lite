import {Box} from '@mui/system';
import Pagination from 'components/Pagination';
import TableBody from 'components/Table/TableBody';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import TableRow from 'components/Table/TableRow';
import {ElevatorDataSchemaView} from 'models/elevator';
import {Resource} from 'models/misc';
import {ACTION_CELL_WIDTH, TableColumnWithRender} from 'models/table';
import {useMemo, useRef, useState} from 'react';
import {formatDate} from 'utils/datetime';
import Actions from './components/Actions';

interface Props {
  dataResource?: Resource<ElevatorDataSchemaView>;
  onPageIndexChange: (value: number) => void;
  onChangeElementsPerPage: (value: number) => void;
  onOpenEditDialog: (item: ElevatorDataSchemaView) => void;
  onOpenDeleteDialog: (item: ElevatorDataSchemaView) => void;
  onOpenPreviewDialog: (item: ElevatorDataSchemaView) => void;
  onDuplicate: (item: ElevatorDataSchemaView) => void;
}

const TechnicalDataTable = ({
  dataResource,
  onPageIndexChange,
  onChangeElementsPerPage,
  onOpenEditDialog,
  onOpenDeleteDialog,
  onOpenPreviewDialog,
  onDuplicate,
}: Props) => {
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => dataResource?.data ?? [], [dataResource]);

  const COLUMNS = useMemo<TableColumnWithRender<ElevatorDataSchemaView>[]>(
    () => [
      {
        headerName: 'Name',
        key: 'elevator-data-schema-name',
        fieldName: 'name',
        width: '450px',
        showShadows: showRightShadow ? 'right' : undefined,
        getExportValue: (elevatorDataSchema) => elevatorDataSchema.name,
        renderCell: (elevatorDataSchema, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{elevatorDataSchema.name}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: '# of fields',
        key: 'elevator-data-schema-no-of-fields',
        width: '90px',
        fieldName: 'noOfFields',
        getExportValue: (elevatorDataSchema) =>
          elevatorDataSchema.additionalInfo.items.length.toString(),
        renderCell: (elevatorDataSchema, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {elevatorDataSchema.additionalInfo.items.length}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Created',
        key: 'elevator-data-schema-created-at',
        width: '100px',

        fieldName: 'createdAt',
        getExportValue: (elevatorDataSchema) =>
          formatDate(new Date(elevatorDataSchema.meta.createdAt))!,
        renderCell: (elevatorDataSchema, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {formatDate(new Date(elevatorDataSchema.meta.createdAt))}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Edited',
        key: 'elevator-data-schema-edited-at',
        width: '100px',
        fieldName: 'lastUpdatedAt',
        getExportValue: (elevatorDataSchema) =>
          formatDate(new Date(elevatorDataSchema.meta.lastUpdatedAt))!,
        renderCell: (elevatorDataSchema, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {formatDate(new Date(elevatorDataSchema.meta.lastUpdatedAt))}
            </TableCellText>
          </Cell>
        ),
      },

      {
        headerName: 'action',
        key: 'service-order-cell-action',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH, // set static width that will not change
        isLast: true,
        noPadding: true,
        showShadows: undefined,
        renderCell: (elevatorDataSchema, cellProps) => (
          <Cell {...cellProps} onClick={undefined}>
            <Actions
              item={elevatorDataSchema}
              onDuplicate={onDuplicate}
              onPreview={onOpenPreviewDialog}
              onDelete={onOpenDeleteDialog}
              onEdit={onOpenEditDialog}
            />
          </Cell>
        ),
      },
    ],
    [
      rows,
      showLeftShadow,
      showRightShadow,
      onOpenPreviewDialog,
      onOpenDeleteDialog,
      onOpenEditDialog,
      onDuplicate,
    ],
  );

  return (
    <>
      <TableContainer
        showNoMatchWarning={false}
        containerRef={containerRef}
        setShowLeftShadow={setShowLeftShadow}
        setShowRightShadow={setShowRightShadow}>
        <TableHeader columns={COLUMNS} />

        <TableBody>
          {/* Row */}
          {rows.map((entry) => (
            <TableRow
              key={`service-order-row-${entry.id}`}
              testId={`service-order-row-${entry.id}`}>
              {COLUMNS.map(({renderCell, ...rest}) =>
                renderCell(entry, {
                  ...rest,
                }),
              )}
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>

      <Box mt={2}>
        <Pagination
          currentIndex={dataResource?.page.pageIndex ?? 0}
          numberOfElementsPerPage={dataResource?.page.pageSize ?? 10}
          totalEntries={dataResource?.total ?? 0}
          onChange={onPageIndexChange}
          onNumberPerPageChange={onChangeElementsPerPage}
        />
      </Box>
    </>
  );
};

export default TechnicalDataTable;
