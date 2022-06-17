import {useEffect, useRef, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import Typography from '@mui/material/Typography';
import {useFetchServiceOrderInvoices} from 'hooks/reactQuery/useInvoice';
import {InfoCard} from 'components/InfoCard';
import Box from '@mui/material/Box';
import {getDataGridHeight} from 'utils/utils';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {columns, makeRows} from './InvoicesDataGridProps';

interface Props {
  serviceOrderId?: string;
}

export const Invoices = ({serviceOrderId}: Props) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  let totalInvoiceRef = useRef(0).current;

  const {
    data: InvoiceList = [],
    isLoading,
    isIdle,
  } = useFetchServiceOrderInvoices(serviceOrderId);

  totalInvoiceRef = totalInvoiceRef || InvoiceList.length;

  useEffect(() => {
    setRows(makeRows(InvoiceList || []));
  }, [InvoiceList]);

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
        containerStyle={{m: 'auto', width: '60%'}}
        label="No invoices yet. They will appear here once added!"
      />
    </Box>
  );

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return (
    <InfoCard
      header={<Typography variant="subtitle1">Invoices</Typography>}
      showHeaderBackground>
      {!totalInvoiceRef ? (
        renderNoRowsSection()
      ) : (
        <DataGridLayout
          rows={rows}
          height={getDataGridHeight(rows.length, 3)}
          columns={columns}
          fullHeight={false}
          hideFooter
          containerStyle={{
            borderBottom: 'none',
          }}
        />
      )}
    </InfoCard>
  );
};
