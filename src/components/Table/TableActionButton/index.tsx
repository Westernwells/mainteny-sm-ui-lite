import IconButton from '@mui/material/IconButton';
import MoreIcon from '@mui/icons-material/MoreVert';

type Props = {
  testId?: string;
  removePadding?: boolean;
  onClick: (event: any) => void;
};

const TableActionButton = ({
  testId = 'table-action-menu-button',
  removePadding,
  onClick,
}: Props) => (
  <IconButton
    data-testid={testId}
    sx={{
      display: 'flex',
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',

      ...(removePadding && {
        padding: 0,
      }),
    }}
    onClick={onClick}>
    <MoreIcon fontSize="small" sx={{color: 'action.active'}} />
  </IconButton>
);

export default TableActionButton;
