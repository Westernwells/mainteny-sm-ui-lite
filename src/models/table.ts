export type TableColumn = {
  headerName: string;
  width: string;
  isHeaderNameHidden?: boolean;
  align?: 'left' | 'right' | 'center';
  flex?: string;
  isFirst?: boolean;
  isLast?: boolean;
  hide?: boolean;
};
