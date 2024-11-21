import {SvgIconComponent} from '@mui/icons-material';

export const ACTION_CELL_WIDTH = '48px';
export const NOTES_CELL_WIDTH = '64px';

export type CellCallbackProps = {
  onClick: () => void;
};

export type HeaderCellProps = {
  headerName: string;
  fieldName?: string;
  onSort?: () => void;
};

export type CellProps = {
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
};

export type TableColumn = CellProps & HeaderCellProps & {key: string};

export type TableColumnWithRender<T> = TableColumn & {
  renderCell: (
    renderObject: T,
    cellProps: TableColumn & CellCallbackProps,
  ) => JSX.Element;
  getExportValue?: (renderObject: T) => string;
};

export type Action = {
  icon: SvgIconComponent;
  label: string;
  onTrigger: () => void;
};
