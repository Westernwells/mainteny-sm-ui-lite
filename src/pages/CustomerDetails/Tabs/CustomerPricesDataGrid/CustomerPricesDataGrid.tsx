import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {ArticleView} from 'models/article';
import {formatNetAmount} from 'utils/currency';
import {convertToText} from 'utils/utils';
import {Actions} from './Action';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'article number',
    flex: 0.7,
  }),
  getColumnProps({
    field: 'name',
    headerName: 'article',
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const {t} = useTranslation();
      return <Typography variant="body2">{t(params.value) || '-'}</Typography>;
    },
  }),
  getColumnProps({
    field: 'type',
    headerName: 'type',
    flex: 0.5,
  }),
  getColumnProps({
    field: 'category',
    headerName: 'category',
  }),
  getColumnProps({
    field: 'unit',
    headerName: 'unit',
  }),
  getColumnProps({
    field: 'purchasePrice',
    headerName: 'Purchase price (excl. VAT)',
    align: 'right',
  }),
  getColumnProps({
    field: 'sellingPrice',
    headerName: 'Selling price (excl. VAT)',
    align: 'right',
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    align: 'center',
    renderCell: (params) => <Actions article={params.row.article} />,
  }),
];

export const makeRows = (articles: ArticleView[]): GridRowsProp =>
  articles.length
    ? articles.map((article: ArticleView, index: number) => ({
        id: index,
        number: article.number,
        name: article.name,
        type: convertToText(article.type),
        category: article.category,
        unit: article.unit,
        purchasePrice: formatNetAmount(article.unitPurchaseAmount),
        sellingPrice: formatNetAmount(article.unitSellingAmount),
        article,
      }))
    : [];
