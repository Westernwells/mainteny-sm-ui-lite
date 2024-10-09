import SendIcon from '@mui/icons-material/Send';
import {useRef} from 'react';
import {Action} from 'models/table';
import TableActionMenu from 'components/Table/TableActionMenu';

export const Actions = () => {
  const OPTIONS = useRef<Action[]>([
    {
      icon: SendIcon,
      label: 'Some Action',
      onTrigger: () => {},
    },
  ]);

  return <TableActionMenu options={OPTIONS.current} />;
};
