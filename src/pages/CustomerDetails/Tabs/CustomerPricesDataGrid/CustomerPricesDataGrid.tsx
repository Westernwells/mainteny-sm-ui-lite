import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {formatNetAmount} from 'utils/currency';
import {convertToText} from 'utils/utils';
import {
  TravelWorkCalculationTypeLabels,
  TravelWorkView,
} from 'models/service-company';
import {t} from 'i18next';
import {Actions} from './Action';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'article number',
    variant: 'titleCase',
    flex: 0.7,
  }),
  getColumnProps({
    field: 'name',
    headerName: 'article',
    variant: 'titleCase',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Typography
        variant="body2"
        sx={{whiteSpace: 'wrap', wordBreak: 'break-all'}}>
        {t(params.value) || '-'}
      </Typography>
    ),
  }),
  getColumnProps({
    field: 'type',
    headerName: 'type',
    variant: 'titleCase',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Typography variant="body2">{t(params.value) || '-'}</Typography>
    ),
    flex: 0.5,
  }),
  getColumnProps({
    field: 'category',
    headerName: 'category',
    variant: 'titleCase',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Typography
        variant="body2"
        sx={{whiteSpace: 'wrap', wordBreak: 'break-all'}}>
        {t(params.value) || '-'}
      </Typography>
    ),
  }),
  getColumnProps({
    field: 'unit',
    headerName: 'unit',
    variant: 'titleCase',
    flex: 0.5,
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Typography
        variant="body2"
        sx={{whiteSpace: 'wrap', wordBreak: 'break-all'}}>
        {t(params.value) || '-'}
      </Typography>
    ),
  }),
  getColumnProps({
    field: 'automate',
    headerName: 'automate',
    variant: 'titleCase',
    renderHeader() {
      return (
        <Typography
          variant="subtitle2"
          color="textSecondary"
          sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
          {t('Automate')}
          <Tooltip
            title={t(
              'Please select the corresponding automation type. This will help to connect the article to the correct values in the invoice. E.g. if you select Hourly Rate (work) this article will be used to calculate the amount for the work hours.',
            )}
            placement="top"
            arrow>
            <InfoIcon sx={{width: '1.2rem', height: '1.2rem'}} />
          </Tooltip>
        </Typography>
      );
    },
  }),
  getColumnProps({
    field: 'purchasePrice',
    headerName: 'Purchase price (excl. VAT)',
    variant: 'noFormat',
    align: 'right',
  }),
  getColumnProps({
    field: 'sellingPrice',
    headerName: 'Selling price (excl. VAT)',
    variant: 'noFormat',
    align: 'right',
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    variant: 'titleCase',
    align: 'center',
    renderCell: (params) => <Actions travelWork={params.row.travelWork} />,
  }),
];

export const makeRows = (travelWorks: TravelWorkView[]): GridRowsProp =>
  travelWorks?.length
    ? travelWorks.map((travelWork: TravelWorkView) => ({
        id: travelWork.id,
        number: travelWork?.article?.externalId || '-',
        name: travelWork?.article.name,
        type: t(convertToText(travelWork?.article.type)),
        category: travelWork?.article.category,
        unit: travelWork?.article.unit,
        purchasePrice: formatNetAmount(travelWork?.article.unitPurchaseAmount),
        sellingPrice: formatNetAmount(travelWork?.article.unitSellingAmount),
        article: travelWork?.article,
        automate:
          t(TravelWorkCalculationTypeLabels[travelWork?.calculationType]) ?? '',
        travelWork,
      }))
    : [];
