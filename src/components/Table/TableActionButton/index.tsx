import IconButton from '@mui/material/IconButton';
import MoreIcon from '@mui/icons-material/MoreVert';
import {SxProps} from '@mui/material';

type Props = {
  testId?: string;
  removePadding?: boolean;
  disabled?: boolean;
  onClick: (event: any) => void;
  buttonStyles?: SxProps;
};

const TableActionButton = ({
  testId = 'table-action-menu-button',
  removePadding,
  disabled,
  onClick,
  buttonStyles,
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
      ...buttonStyles,
    }}
    disabled={disabled}
    onClick={onClick}>
    <MoreIcon fontSize="small" sx={{color: 'action.active'}} />
  </IconButton>
);

export default TableActionButton;
