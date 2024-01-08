/* eslinst-disable */
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {DataGridLayout} from 'components/DataGridLayout';
import {useEffect, useRef, useState} from 'react';
import {getDataGridHeight} from 'utils/utils';
import {InfoCard} from 'components/InfoCard';
import {GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {useFormatDate} from 'hooks/useFormatDate';
import {EmptySection} from 'components/EmptySection';
import {ServiceOrderView} from 'models/service-order';
import {useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {Info} from '@mui/icons-material';
import {Tooltip} from 'components/Tooltip';
import {columns, makeRows} from './QuotationsDataGridProps';

interface Props {
  serviceOrder?: ServiceOrderView;
}

export const Quotation = ({serviceOrder}: Props) => {
  const formatDate = useFormatDate();
  const {t} = useTranslation();
  const [rows, setRows] = useState<GridRowsProp>([]);
  let totalQuotationRef = useRef(0).current;
  const {data: quotation} = useQuotationDetails(
    serviceOrder && serviceOrder.additionalInfo.quotationId
      ? serviceOrder.additionalInfo.quotationId
      : '',
  );

  totalQuotationRef = totalQuotationRef || quotation ? 1 : 0;

  useEffect(() => {
    if (quotation) setRows(makeRows([quotation], formatDate));
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
      />
    </Box>
  );

  return (
    <InfoCard
      header={<Typography variant="subtitle1">{t('Quotations')}</Typography>}
      showHeaderBackground
      headerActionIcon={
        <Tooltip
          componentsProps={{
            tooltip: {
              sx: {
                color: 'dark',
              },
            },
          }}
          title={t(
            'Only the service orders created out of a quotation will have entries here.',
          )}
          arrow
          placement="top">
          <Info />
        </Tooltip>
      }>
      {!totalQuotationRef ? (
        renderNoRowsSection()
      ) : (
        <DataGridLayout
          fullHeight={false}
          height={getDataGridHeight(rows.length, 100)}
          isWidget
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
