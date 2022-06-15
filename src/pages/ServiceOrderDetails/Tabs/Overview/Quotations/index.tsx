/* eslinst-disable */
import Typography from '@mui/material/Typography';
import {DataGridLayout} from 'components/DataGridLayout';
import {useEffect, useState} from 'react';
import {getDataGridHeight} from 'utils/utils';
import {InfoCard} from 'components/InfoCard';
import {GridRowsProp} from '@mui/x-data-grid';
import {EmptySection} from 'components/EmptySection';
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

  const renderNoRowsSection = () => (
    <EmptySection
      illustration="clipboard"
      size="tiny"
      containerStyle={{m: 'auto', width: '60%'}}
      label={`No quotations yet. It will appear here once added!
    Please click the button below to add.`}
      showActionBtn
      btnLabel="+ Add New Article"
      btnAction={() => {}}
    />
  );

  return (
    <InfoCard
      header={<Typography variant="subtitle1">Quotations</Typography>}
      showHeaderBackground>
      <DataGridLayout
        fullHeight={false}
        headerHeight={30}
        height={getDataGridHeight(rows.length, 3)}
        showHeaderFullBorder
        hideFooter
        noRowsEmptySection={renderNoRowsSection()}
        rows={rows}
        columns={columns}
        containerStyle={{
          borderBottom: 'none',
        }}
      />
    </InfoCard>
  );
};
