import {SvgIconComponent} from '@mui/icons-material';

export const ACTION_CELL_WIDTH = '48px';

export type CellCallbackProps = {
  onClick: () => void;
};

export type HeaderCellProps = {
  headerName: string;
  fieldName?: string;
  onSort?: () => void;
};

export type CellProps = {
  width: string;
  isHeaderNameHidden?: boolean;
  align?: 'left' | 'right' | 'center';
  flex?: string;
  isFirst?: boolean;
  isLast?: boolean;
  hide?: boolean;
};

export type TableColumn = CellProps & HeaderCellProps & {};

export type TableColumnWithRender<T> = TableColumn & {
  renderCell: (renderObject: T, cellProps: CellCallbackProps) => JSX.Element;
};

export type Action = {
  icon: SvgIconComponent;
  label: string;
  onTrigger: () => void;
};
