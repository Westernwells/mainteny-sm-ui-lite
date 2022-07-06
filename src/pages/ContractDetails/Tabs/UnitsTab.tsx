import {FC, useEffect, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';

import {DataGridLayout} from 'components/DataGridLayout';
import {makePage} from 'utils/paging-utils';
import {TabContentContainer} from 'components/TabContentContainer';
import {EmptySection} from 'components/EmptySection';
import {useNavigate} from 'react-router';
import {ContractElevatorSimpleView} from 'models/contract';
import {ElevatorView} from 'models/elevator';
import {columns, makeRows} from './UnitsDataGridProps';

interface Props {
  elevators: ContractElevatorSimpleView[];
}

export const UnitsTab: FC<Props> = ({elevators}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(makePage(0, 25)); // TODO: implement paging
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    if (elevators.length) {
      setRows(
        makeRows({
          elevators: elevators.map(
            (elevator) =>
              ({
                ...elevator.elevator,
              } as ElevatorView),
          ),
        }),
      );
    } else {
      setRows([]);
    }
  }, [elevators]);

  useEffect(() => {
    if (elevators) {
      setPageCount(Math.ceil(elevators.length / page.pageSize));
    }
  }, [elevators, page]);

  return (
    <TabContentContainer>
      <DataGridLayout
        hideFooter={pageCount <= 1}
        noRowsEmptySection={
          <EmptySection
            illustration="clipboard"
            size="tiny"
            containerStyle={{my: 'auto'}}
            btnAction={() => navigate('/units/new')}
            label="No units yet. They will appear here once added!"
            btnLabel="+ Add Unit"
            showActionBtn
          />
        }
        noResultsEmptySection={
          <EmptySection
            illustration="clipboard"
            size="tiny"
            containerStyle={{my: 'auto'}}
            btnAction={() => navigate('/units/new')}
            label="No units yet. They will appear here once added!"
            btnLabel="+ Add Unit"
            showActionBtn
          />
        }
        rows={rows}
        columns={columns}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex}
        handlePageSizeChange={(newPageSize) =>
          setPage({...page, pageSize: newPageSize})
        }
        handlePageChange={(newPage) => setPage({...page, pageIndex: newPage})}
      />
    </TabContentContainer>
  );
};
