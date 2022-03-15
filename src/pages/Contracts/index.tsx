import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';
import {
  useContractElevatorCount,
  useQueryContract,
} from 'hooks/reactQuery/useContract';
import {columns, makeRows} from './ContractsDataGridProps';
import {ContractOrderField, ContractView} from '../../models/contract';
import {Order} from '../../models/misc';
import {createEmptyResource, makePage} from '../../utils/paging-utils';
import {Widget} from '../../components/Widget';

const pageSize = 10;

export const Contracts = () => {
  const [search, setSearch] = useState('');
  const [page] = useState(makePage(0, pageSize));
  const [showFilter, setShowFilter] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string[]>([]);
  const [contractor, setContractor] = useState<string[]>([]);
  const [cost, setCost] = useState<number[][]>([]);
  const [contractorFilterItems, setConractorFileterItems] = useState<string[]>(
    [],
  );
  const [rows, setRows] = useState<GridRowsProp>([]);

  const {data: contractResource = createEmptyResource<ContractView>(10)} =
    useQueryContract(
      {
        order: Order.DESC,
        orderBy: ContractOrderField.CREATED_TIME,
        pageIndex: page.pageIndex,
        pageSize: page.pageSize,
        query: search,
        status: [],
      },
      {expiryDate, contractor, price: cost},
    );
  const {data: contractWithUnits} = useContractElevatorCount(
    contractResource.data,
  );

  const costRangeConvertor = (selectedItems: string[]) => {
    const range: number[][] = [];
    selectedItems.forEach((item) => {
      switch (item) {
        case 'Below 1000 €':
          range.push([0, 1000]);
          break;

        case '1000 - 3000 €':
          range.push([1000, 3000]);
          break;

        case '3000 - 5000 €':
          range.push([3000, 5000]);
          break;

        case 'Above 5000 €':
          range.push([5000, 99999]);
          break;

        default:
          break;
      }
    });
    setCost(range);
  };

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
      <Box display="flex" justifyContent="space-between">
        <Box sx={{mb: 4}}>
          <Typography variant="h4">Contracts</Typography>
        </Box>
        <Box mt={1}>
          <Widget
            searchPlaceholder="Try 'Astralift BV'"
            onSearchTextChanged={setSearch}
            setShowFilter={setShowFilter}
            showFilter={showFilter}
          />
        </Box>
      </Box>
      <Fade in={showFilter} unmountOnExit>
        <Box>
          <FilterFields setShowFilter={setShowFilter}>
            <MultipleSelectCheckmarks
              label="Expiry Date"
              options={[
                'Last 14 days', // TODO: Create an enum to handle this
                'Today',
                'Next 7 days',
                'Next 14 days',
              ]}
              getSelectedValue={(item) => setExpiryDate(item)}
              multiple={false}
            />

            <MultipleSelectCheckmarks
              label="Contractor"
              options={contractorFilterItems}
              getSelectedValue={(item) => setContractor(item)}
            />

            <MultipleSelectCheckmarks
              label="Cost/year"
              options={[
                'Below 1000 €',
                '1000 - 3000 €',
                '3000 - 5000 €',
                'Above 5000 €',
              ]}
              getSelectedValue={(item) => costRangeConvertor(item)}
              multiple={false}
            />
          </FilterFields>
        </Box>
      </Fade>
      <DataGridLayout rows={rows} columns={columns} />
    </Box>
  );
};
