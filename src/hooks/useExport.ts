import {capitalize} from 'lodash';
import {createExcelContent} from 'utils/utils';
import {downloadExcel} from 'utils/download';
import {useTranslation} from 'react-i18next';
import {TableColumnWithRender} from 'models/table';
import {useSnackbar} from 'hooks/useSnackbar';
import {QueryObserverResult} from 'react-query';
import {RestError} from 'models/misc';

type ExportTableSheetProps<T, K> = {
  columns: TableColumnWithRender<T>[];
  fileName: string;
  excludedFields?: string[];
  aggregateCallback: (data: K[]) => T[];
  refetchCallback: () => Promise<QueryObserverResult<K[], RestError>>;
};

export function useExportTableSheet<T, K>({
  columns,
  fileName,
  excludedFields = [],
  aggregateCallback,
  refetchCallback,
}: ExportTableSheetProps<T, K>) {
  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();

  return async () => {
    try {
      // Initiate the export process by fetching all filtered service orders
      const {data} = await refetchCallback();

      if (!data || data.length === 0) {
        return;
      }

      const filteredColumns = columns.filter(
        (col) => !excludedFields.includes(col.key),
      );

      const headers = filteredColumns.map((col) =>
        capitalize(t(col.headerName)),
      );

      const dataRows = aggregateCallback(data).map((tableEntry) =>
        filteredColumns.map((col) => col.getExportValue?.(tableEntry) || ''),
      );

      const excelContent = createExcelContent({
        headers,
        rows: dataRows,
        sheetName: fileName,
      });

      downloadExcel({excelContent, filename: fileName});
    } catch (error) {
      console.error('Error exporting Excel:', error);
      enqueueSnackbar(t('Failed to export Excel'), {variant: 'error'});
    }
  };
}
