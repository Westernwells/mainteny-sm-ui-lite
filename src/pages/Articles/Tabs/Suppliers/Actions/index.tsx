import SendIcon from '@mui/icons-material/Send';
import {useRef} from 'react';
import {Action} from '../../../../../models/table';
import TableActionMenu from '../../../../../components/Table/TableActionMenu';

interface Props {
  email: string;
}

export const Actions = ({email}: Props) => {
  const OPTIONS = useRef<Action[]>([
    {
      icon: SendIcon,
      label: 'Send email',
      onTrigger: () => {
        window.open(`mailto:${email}`, '_blank');
      },
    },
  ]);

  return <TableActionMenu options={OPTIONS.current} />;
};
