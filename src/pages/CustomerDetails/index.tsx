/* eslint-disable */
import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import ElevatorIcon from '@mui/icons-material/Elevator';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {GridRowsProp} from '@mui/x-data-grid';
import {staticContracts, contractWithUnits} from 'pages/Contracts/data';
import {DataGridLayout} from 'components/DataGridLayout';
import {columns, makeRows} from 'pages/Contracts/ContractsDataGridProps';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {createEmptyResource} from 'utils/paging-utils';
import {ContractView} from 'models/contract';
import {CustomerDetailsWidgets} from './CustomerDetailsWidgets';
import {OverviewTab} from './Tabs/OverviewTab';

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Units',
    icon: <ElevatorIcon />,
  },
  {
    label: 'Contracts',
    icon: <FileCopyIcon />,
  },
];

export const CustomerDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const [_expiryDate, setExpiryDate] = useState<string[]>([]);
  const [showFilter] = useState(false);
  const [_contractor, setContractor] = useState<string[]>([]);
  const [_cost, setCost] = useState<number[][]>([]);
  const [contractorFilterItems, setConractorFileterItems] = useState<string[]>(
    [],
  );
  const [rows, setRows] = useState<GridRowsProp>([]);
  const {data: contractResource = createEmptyResource<ContractView>(10)} =
    staticContracts;
  console.log(_expiryDate, _contractor, _cost, contractResource);
  useEffect(() => {
    const options: string[] = [];
    console.log('test');

    if (contractWithUnits) {
      // TODO: Resolve 'any' here
      contractWithUnits?.forEach((item: any) => {
        if (
          !options.includes(item.serviceCompany.name) &&
          !contractorFilterItems.includes(item.serviceCompany.name)
        ) {
          options.push(item.serviceCompany.name);
        }
      });
      setRows(makeRows(contractWithUnits));
    } else {
      setRows([]);
    }
    setConractorFileterItems([...contractorFilterItems, ...options]);
    if (!showFilter) {
      setExpiryDate([]);
      setContractor([]);
      setCost([]);
    }
  }, [contractWithUnits, showFilter]);
  return (
    <Box>
      <Tabs
        tabItems={tabItems}
        getCurrentTabIndex={(index) => setTabValue(index)}>
        <TabsBody value={tabValue} index={0}>
          <OverviewTab />
        </TabsBody>
      </Tabs>

      {/* <CustomerDetailsWidgets containerStyle={{ mb: '1.5em'}} /> */}
      <DataGridLayout rows={rows} columns={columns} />
    </Box>
  );
};
