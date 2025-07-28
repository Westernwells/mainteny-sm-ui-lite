import {Box} from '@mui/material';
import {Avatar} from 'components/Avatar';
import TableCellText from 'components/Table/TableCellText';
import {TaskAssignmentType, TaskTableRow} from 'models/tasks';
import {useTranslation} from 'react-i18next';
import {theme} from 'theme';
import {convertUserAccountSimpleViewToAvatar} from 'utils/account-utils';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';

type Props = {
  task: TaskTableRow;
};

const TaskAssignedToCell = ({task}: Props) => {
  const {t} = useTranslation();

  const {assignedEmployee, assignmentType} = task;
  const {userAccount: assignedEmployeeAccount} = assignedEmployee ?? {};

  if (assignedEmployeeAccount) {
    return (
      <Avatar
        labelStyles={{
          color: theme.palette.primary.light,
        }}
        key={`task-avatar-${task.assignedEmployee?.id}`}
        userAccount={convertUserAccountSimpleViewToAvatar(
          assignedEmployeeAccount,
        )}
      />
    );
  }

  if (assignmentType === TaskAssignmentType.OFFICE) {
    return (
      <Box display="flex" flexDirection="row" alignItems="center">
        <BusinessOutlinedIcon sx={{width: '20px', height: '20px'}} />
        <TableCellText mt="5px" ml={1}>
          {t('Office')}
        </TableCellText>
      </Box>
    );
  }

  if (assignmentType === TaskAssignmentType.TECHNICIANS) {
    return (
      <Box display="flex" flexDirection="row" alignItems="center">
        <BuildOutlinedIcon sx={{width: '20px', height: '20px'}} />
        <TableCellText mt="5px" ml={1}>
          {t('Technicians')}
        </TableCellText>
      </Box>
    );
  }

  return <TableCellText>-</TableCellText>;
};

export default TaskAssignedToCell;
