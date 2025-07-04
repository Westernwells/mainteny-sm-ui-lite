import {SvgIconComponent} from '@mui/icons-material';

export const ACTION_CELL_WIDTH = '48px';
export const NOTES_CELL_WIDTH = '64px';
export const DESCRIPTION_CELL_WIDTH = '100px';

export type CellCallbackProps = {
  onClick?: () => void;
};

export type HeaderCellProps = {
  headerName: string;
  fieldName?: string;
  onSort?: () => void;
  headerIconTooltip?: string;
  headerIcon?: React.ReactNode;
};

export type CellProps = {
  id?: string;
  width?: string;
  isHeaderNameHidden?: boolean;
  align?: 'left' | 'right' | 'center';
  justifyContent?: 'left' | 'right' | 'center' | 'justify-content';
  maxWidth?: string;
  flex?: string;
  isFirst?: boolean;
  isLast?: boolean;
  hide?: boolean;
  showShadows?: 'left' | 'right';
  noWidthLimit?: boolean;
  firstSticky?: boolean;
  lastSticky?: boolean;
  noPadding?: boolean;
  textTransform?: boolean;
};

export type TableColumn = CellProps & HeaderCellProps & {key: string};

export type TableColumnWithRender<T> = TableColumn & {
  renderCell: (
    renderObject: T,
    cellProps: TableColumn & CellCallbackProps,
  ) => JSX.Element;
  getExportValue?: (renderObject: T) => string;
};

// Deprecated => use MenuAction
export type Action = {
  icon: SvgIconComponent;
  label: string;
  onTrigger: () => void;
};

export type ExportColumn<T> = {
  getExportValue?: (renderObject: T) => string;
};

export type CustomizableColumn = {
  id: string;
  columnName: string;
  orderIndex: number;
  fixed: boolean;
  default: boolean;
};

export enum CustomizableTable {
  UNIT = 'UNIT',
}

export type DragData = {
  id: string;
  index: number;
  type: 'main' | 'sub';
  parentIndex?: number;
};
