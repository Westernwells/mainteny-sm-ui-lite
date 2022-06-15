/* eslinst-disable */
import Typography from '@mui/material/Typography';
import {DataGridLayout} from 'components/DataGridLayout';
import {useEffect, useRef, useState} from 'react';
import {getDataGridHeight} from 'utils/utils';
import {InfoCard} from 'components/InfoCard';
import {GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {EmptySection} from 'components/EmptySection';
import {ServiceOrderView} from 'models/service-order';
import {useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {columns, makeRows} from './QuotationsDataGridProps';

interface Props {
  serviceOrder?: ServiceOrderView;
}

export const Quotation = ({serviceOrder}: Props) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  let totalQuotationRef = useRef(0).current;
  const {data: quotation} = useQuotationDetails(
    serviceOrder && serviceOrder.additionalInfo.quotationId
      ? serviceOrder.additionalInfo.quotationId
      : '',
  );

  totalQuotationRef = totalQuotationRef || quotation ? 1 : 0;

  useEffect(() => {
    if (quotation) setRows(makeRows([quotation]));
  }, [quotation]);

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
        label="No quotations yet. It will appear here once added!"
        showActionBtn
        btnLabel="+ Add New Article"
        btnAction={() => {}}
      />
    </Box>
  );

  return (
    <InfoCard
      header={<Typography variant="subtitle1">Quotations</Typography>}
      showHeaderBackground>
      {!totalQuotationRef ? (
        renderNoRowsSection()
      ) : (
        <DataGridLayout
          fullHeight={false}
          headerHeight={30}
          height={getDataGridHeight(rows.length, 3)}
          showHeaderFullBorder
          hideFooter
          rows={rows}
          columns={columns}
          containerStyle={{
            borderBottom: 'none',
          }}
        />
      )}
    </InfoCard>
  );
};
