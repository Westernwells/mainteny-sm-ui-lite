import React, {useState} from 'react';
import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {Box, Tooltip} from '@mui/material';
import {convertToText} from 'utils/utils';
import {
  TextBlockOrderField,
  TextBlockRow,
  TextBlockView,
} from 'models/text-block';
import {format} from 'date-fns';
import {getColumnProps} from 'components/DataGridLayout';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {stripHtmlTags} from 'utils/text-block';
import {Actions} from './Actions';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => {
    const {t} = useTranslation();
    return (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName && t(params.colDef.headerName)}
      </Typography>
    );
  },
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2" mx="0em">
      {params.value}
    </Typography>
  ),
};

const defaultAlignment: {
  flex: number;
  headerAlign: GridAlignment;
  align: GridAlignment;
} = {
  flex: 1,
  headerAlign: 'center',
  align: 'center',
};

export const columns = (
  getEditableTextBlocks: (item: TextBlockRow) => void,
  getDeletableTextBlocks: (item: TextBlockRow) => void,
  getPreviewTextBlocks: (item: TextBlockRow) => void,
): GridColDef[] => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const {t} = useTranslation();

  return [
    {
      headerName: 'NAME',
      field: TextBlockOrderField.NAME,
      sortable: true,
      type: 'string',
      flex: 3,
      headerAlign: 'left',
      renderHeader: (params: GridColumnHeaderParams) => (
        <Typography variant="subtitle2" color="textSecondary">
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          position="relative"
          sx={{width: '100%'}}
          onMouseEnter={() => setHoveredRow(params.row.id)}
          onMouseLeave={() => setHoveredRow(null)}>
          <Typography variant="body2" sx={{paddingRight: '1.1em'}}>
            {params.row[TextBlockOrderField.NAME]}
          </Typography>

          {hoveredRow === params.row.id && (
            <Tooltip title={stripHtmlTags(params.row.text)} placement="top">
              <Typography sx={{marginBottom: '-0.4em'}}>
                <AlertInfoIcon width="16px" height="16px" />
              </Typography>
            </Tooltip>
          )}
        </Box>
      ),
    },
    getColumnProps({
      headerName: 'CATEGORY',
      field: TextBlockOrderField.CATEGORY,
      sortable: true,
      type: 'string',
      flex: 1.5,
      headerAlign: 'left',
      ...defaultProps,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          {t(convertToText(params.row[TextBlockOrderField.CATEGORY]))}
        </Box>
      ),
    }),
    {
      field: 'wordCount',
      headerName: 'WORD COUNT',
      sortable: false,
      type: 'number',
      flex: 1,
      headerAlign: 'right',
      ...defaultProps,
      renderCell: (params) => (
        <Box display="flex" alignItems="right">
          {params.row.wordCount}
        </Box>
      ),
    },
    getColumnProps({
      headerName: 'CREATED',
      field: TextBlockOrderField.CREATED_AT,
      sortable: true,
      type: 'string',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      ...defaultProps,
    }),
    {
      field: 'editedAt',
      headerName: 'EDITED',
      sortable: false,
      type: 'string',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      ...defaultProps,
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      sortable: false,
      type: 'actions',
      renderHeader: (params: GridColumnHeaderParams) => (
        <Typography variant="subtitle2" color="textSecondary">
          {params.colDef.headerName && t(params.colDef.headerName)}
        </Typography>
      ),
      renderCell: (params) => (
        <Actions
          onEdit={() => getEditableTextBlocks(params.row)}
          onDelete={() => getDeletableTextBlocks(params.row)}
          onPreview={() => getPreviewTextBlocks(params.row)}
        />
      ),
      ...defaultAlignment,
      flex: 0.5,
    },
  ];
};

export const makeRows = (textBlocks: TextBlockView[]): GridRowsProp =>
  textBlocks
    ? textBlocks.map((item: TextBlockView) => ({
        id: item.id,
        [TextBlockOrderField.NAME]: item.name || '-',
        [TextBlockOrderField.CATEGORY]: item.category,
        [TextBlockOrderField.CREATED_AT]:
          format(new Date(item.meta.createdAt), 'dd.MM.yyyy') || '-',
        text: item.text,
        wordCount: stripHtmlTags(item.text)
          .split(/\s+/)
          .filter((word) => word.length > 0).length,
        editedAt:
          format(new Date(item.meta.lastUpdatedAt), 'dd.MM.yyyy') || '-',
      }))
    : [];
