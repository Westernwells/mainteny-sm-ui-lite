import Box from '@mui/material/Box';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {useUseQueryCustomerContracts} from 'hooks/reactQuery/useContract';
import {ContractOrderField, ContractView} from 'models/contract';
import {Order} from 'models/misc';
import {useEffect, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {columns, makeRows} from './ContractCardDataGridProps';

interface Props {
  customerId?: string;
  query: string;
  getTotalContracts?: (val: number) => void;
}

export const OverviewContractsCard = ({
  customerId,
  query,
  getTotalContracts,
}: Props) => {
  const [page] = useState(makePage(0, 3));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const {data: contractResource = createEmptyResource<ContractView>(3)} =
    useUseQueryCustomerContracts(
      {
        query,
        orderBy: ContractOrderField.EXPIRY_TIME,
        order: Order.ASC,
        pageIndex: page.pageIndex,
        pageSize: page.pageSize,
      },
      customerId,
    );
  useEffect(() => {
    setRows(makeRows(contractResource));
    if (getTotalContracts) {
      getTotalContracts(contractResource.total);
    }
  }, [contractResource]);

  return (
    <Box>
      <DataGridLayout
        fullHeight={false}
        height={230}
        hideFooter
        rows={rows}
        columns={columns}
        containerStyle={{
          borderBottom: 'none',
        }}
      />
    </Box>
  );
};
