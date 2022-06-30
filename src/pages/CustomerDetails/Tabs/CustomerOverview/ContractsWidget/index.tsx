import {useEffect, useRef, useState} from 'react';
import {OpenInNew} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import {GridRowsProp} from '@mui/x-data-grid';

import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';
import {SearchInput} from 'components/SearchInput';
import {useUseQueryCustomerContracts} from 'hooks/reactQuery/useContract';
import {ContractOrderField, ContractView} from 'models/contract';
import {Order} from 'models/misc';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {padNumber} from 'utils/utils';
import {columns, makeRows} from './ContractsWidgetDataGridProps';

interface Props {
  customerId?: string;
  getTotalContracts?: (val: number) => void;
  openTab: () => void;
}

export const ContractsWidget = ({
  customerId,
  getTotalContracts,
  openTab,
}: Props) => {
  const [contractQuery, setContractQuery] = useState('');
  const [page, setPage] = useState(makePage(0, 500));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const totalContractsRef = useRef(0);

  const {
    data: contractResource = createEmptyResource<ContractView>(3),
    isFetching,
    isFetched,
  } = useUseQueryCustomerContracts(
    {
      query: contractQuery || '',
      orderBy: ContractOrderField.EXPIRY_TIME,
      order: Order.ASC,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
    },
    customerId,
  );
  useEffect(() => {
    setRows(makeRows(contractResource));
    setPageCount(Math.ceil(contractResource.total / page.pageSize));
    if (getTotalContracts) {
      getTotalContracts(contractResource.total);
    }
  }, [contractResource]);

  const addNewContract = () => {
    // TODO Navigate to add new Contract page
    console.log('add new Contract');
  };

  totalContractsRef.current =
    totalContractsRef.current || contractResource.total;

  return (
    <InfoCard
      header={
        <Box display="flex">
          <Typography variant="subtitle1">Contracts</Typography>
          {rows.length > 0 && (
            <Box
              sx={{
                fontSize: '0.750em',
                lineHeight: '20px',
                letterSpacing: '0.4px',
                color: 'white',
                background: '#457892',
                borderRadius: '4px',
                marginLeft: '0.625em',
                display: 'flex',
                alignItems: 'center',
                padding: '0 0.625em',
              }}>
              {padNumber(contractResource.total)}
            </Box>
          )}
        </Box>
      }
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}
      handleAction={openTab}
      headerActionIcon={<OpenInNew />}
      showHeaderBackground>
      {isFetched && !totalContractsRef.current && (
        <EmptySection
          illustration="clipboard"
          size="tiny"
          containerStyle={{m: 'auto', width: '60%', minHeight: '24.375em'}}
          label="No contracts yet. Please click the button below to add!"
          showActionBtn
          btnLabel="+ Add New Contract"
          btnAction={addNewContract}
        />
      )}

      {!!totalContractsRef.current && (
        <>
          <SearchInput
            containerStyle={{
              height: '100%',
              border: '1px solid #E4E9F2',
              borderRadius: '4px',
              marginBottom: '0.938em',
              marginTop: '0.313em',
            }}
            placeholder="Search by id, revenue, date"
            onValueChanged={(value: string) => setContractQuery(value)}
          />
          <DataGridLayout
            fullHeight={false}
            height={320}
            rows={rows}
            loading={isFetching}
            columns={columns}
            isWidget
            containerStyle={{
              borderBottom: 'none',
            }}
            hideFooter={pageCount <= 1}
            pageIndex={page.pageIndex + 1}
            pageSize={page.pageSize}
            handlePageSizeChange={(newPageSize: number) =>
              setPage({...page, pageSize: newPageSize})
            }
            handlePageChange={(newPage: number) => {
              setPage({...page, pageIndex: newPage - 1});
            }}
            pageCount={pageCount}
            totalRows={contractResource.total}
          />
        </>
      )}
    </InfoCard>
  );
};
