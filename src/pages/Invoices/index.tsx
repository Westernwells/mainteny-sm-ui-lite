import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import {GridRowsProp} from '@mui/x-data-grid';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {DataGridLayout} from 'components/DataGridLayout';
import {BtnGroupType} from 'models/misc';
import {InvoiceStatus, InvoiceStatusView} from 'models/invoice';
import {columns, makeRows} from './InvoicesDataGridProps';
import {makePage} from '../../utils/paging-utils';
import {invoiceResource} from './dummyData';
// import {useInvoices} from '../../hooks/reactQuery/useInvoice';
import {Widget} from '../../components/Widget';

export const Invoices = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(makePage(0, 10)); // TODO: implement paging
  const [showFilter, setShowFilter] = useState(false);
  const [amount, setAmount] = useState<number[][]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [rows, setRows] = useState<GridRowsProp>([]);
  // const {data: invoiceResource} = useInvoices(
  //   {
  //     pageIndex: page.pageIndex,
  //     pageSize: page.pageSize,
  //     query: search,
  //     status: [InvoiceStatus.PAID, InvoiceStatus.NOT_PAID],
  //   },
  //   {amount, status},
  // );

  const amountRangeConvertor = (selectedItems: string[]) => {
    const range: number[][] = [];
    selectedItems.forEach((item) => {
      switch (item) {
        case 'Below 1000 EUR':
          range.push([0, 1000]);
          break;

        case '1000 - 3000 EUR':
          range.push([1000, 3000]);
          break;

        case '3000 - 5000 EUR':
          range.push([3000, 5000]);
          break;

        case 'Above 5000 EUR':
          range.push([5000, 99999]);
          break;

        default:
          break;
      }
    });
    setAmount(range);
  };

  useEffect(() => {
    if (invoiceResource?.data) {
      setRows(makeRows(invoiceResource));
    } else {
      setRows([]);
    }
    if (!showFilter) {
      setAmount([]);
      setStatus([]);
    }
  }, [invoiceResource, showFilter]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <Box sx={{mb: 4}}>
          <Typography variant="h4">Invoices</Typography>
        </Box>
        <Box mt={1}>
          <Widget
            btnGroupType={BtnGroupType.ICON}
            searchPlaceholder="Try 'INV000001'"
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
              label="Invoice Date"
              options={['This Week', 'Next Week', 'Next Month']}
              getSelectedValue={(item) => console.log(item)}
              multiple={false}
            />
            <MultipleSelectCheckmarks
              label="Service Company"
              options={['Maintenance Experts Gmbh', 'Maintenance Masters']}
              getSelectedValue={(item) => console.log(item)}
            />
            <MultipleSelectCheckmarks
              label="Total Amount"
              options={[
                'Below 1000 EUR',
                '1000 - 3000 EUR',
                '3000 - 5000 EUR',
                'Above 5000 EUR',
              ]}
              getSelectedValue={(item) => amountRangeConvertor(item)}
              multiple={false}
            />

            <MultipleSelectCheckmarks
              label="Status"
              options={Object.values(InvoiceStatusView).map((value) => value)}
              getSelectedValue={(items) =>
                setStatus(
                  items.map((item) =>
                    item === 'Paid'
                      ? InvoiceStatus.PAID
                      : InvoiceStatus.NOT_PAID,
                  ),
                )
              }
              multiple={false}
            />
            <MultipleSelectCheckmarks
              label="Service Type"
              options={['Maintenance', 'Repair', 'Callout', 'Emergency']}
              getSelectedValue={(item) => console.log(item)}
            />
          </FilterFields>
        </Box>
      </Fade>
      <DataGridLayout rows={rows} columns={columns} />
    </Box>
  );
};
