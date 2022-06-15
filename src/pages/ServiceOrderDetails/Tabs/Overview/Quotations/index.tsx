/* eslinst-disable */
import Typography from '@mui/material/Typography';
import {DataGridLayout} from 'components/DataGridLayout';
import {useEffect, useState} from 'react';
import {getDataGridHeight} from 'utils/utils';
import {InfoCard} from 'components/InfoCard';
import {GridRowsProp} from '@mui/x-data-grid';
import {ServiceOrderView} from 'models/service-order';
import {useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {columns, makeRows} from './QuotationsDataGridProps';

interface Props {
  serviceOrder?: ServiceOrderView;
}

export const Quotation = ({serviceOrder}: Props) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const {data: quotation} = useQuotationDetails(
    serviceOrder && serviceOrder.additionalInfo.quotationId
      ? serviceOrder.additionalInfo.quotationId
      : '',
  );

  useEffect(() => {
    if (quotation) setRows(makeRows([quotation]));
  }, [quotation]);

  return (
    <InfoCard
      header={<Typography variant="subtitle1">Quotations</Typography>}
      showHeaderBackground>
      <DataGridLayout
        fullHeight={false}
        height={getDataGridHeight(rows.length, 3)}
        hideFooter
        rows={rows}
        columns={columns}
        containerStyle={{
          borderBottom: 'none',
        }}
      />
      {/* {contracts.length > 3 ? (
        <Box
          sx={{textAlign: 'center', cursor: 'pointer'}}
          onClick={() => setShowAll(!showAll)}>
          <Typography variant="caption" color={theme.palette.info.main}>
            {showAll ? 'see less' : 'see more'}
          </Typography>
        </Box>
      ) : null} */}
    </InfoCard>
  );
};
