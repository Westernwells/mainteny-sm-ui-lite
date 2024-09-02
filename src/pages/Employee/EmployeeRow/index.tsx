import {IconButton} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import React, {useMemo, useRef, useState} from 'react';
import Cell from 'components/Table/TableCell';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Menu from '@mui/material/Menu';
import {EmployeeContractTableRow} from '../../../models/employee';
import {capitalize} from '../../../utils/utils';
import {TableColumn} from '../../../models/table';
import {Actions} from '../Actions';
import {StatusChip} from '../../../components/StatusChip';
import {getAvailabilityChipColor} from '../../../utils/availability';
import TableRow from '../../../components/Table/TableRow';

type Props = {
  employeeDetails: EmployeeContractTableRow;
  columns: TableColumn[];
  onClick?: () => void;
};

const EmployeeRow = ({employeeDetails, columns, onClick}: Props) => {
  const {t} = useTranslation();

  const anchorEl = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const handleToggleNumberPerPageMenu = (value: boolean) => () => {
    setOpen(value);
  };

  const roles = useMemo(
    () => capitalize(employeeDetails.roles),
    [employeeDetails.roles],
  );

  return (
    <TableRow testId="employee-row-container">
      {/* <Cell columnDetails={columns[0]}> */}
      {/*  <Checkbox */}
      {/*    disableRipple */}
      {/*    disableTouchRipple */}
      {/*    sx={{ */}
      {/*      widht: '15px', */}
      {/*      height: '15px', */}
      {/*    }} */}
      {/*  /> */}
      {/* </Cell> */}
      <Cell columnDetails={columns[1]} gap={2} onClick={onClick}>
        <Avatar src={employeeDetails.photoUrl} sx={{width: 24, height: 24}} />
        <Typography noWrap>{employeeDetails.name}</Typography>
      </Cell>
      <Cell columnDetails={columns[2]} onClick={onClick}>
        <Typography variant="body2" sx={{textTransform: 'capitalize'}} noWrap>
          {t(roles)}
        </Typography>
      </Cell>
      <Cell columnDetails={columns[3]} onClick={onClick}>
        <Typography noWrap>{employeeDetails.address}</Typography>
      </Cell>
      <Cell columnDetails={columns[4]} onClick={onClick}>
        <Typography noWrap>{employeeDetails.team}</Typography>
      </Cell>
      <Cell columnDetails={columns[5]} onClick={onClick}>
        <Typography noWrap>{employeeDetails.phone}</Typography>
      </Cell>
      <Cell columnDetails={columns[6]} onClick={onClick}>
        <Typography noWrap>{employeeDetails.shift}</Typography>
      </Cell>
      <Cell columnDetails={columns[7]} onClick={onClick}>
        <StatusChip
          label={employeeDetails.availability}
          {...getAvailabilityChipColor(employeeDetails.availability)}
        />
      </Cell>
      <Cell columnDetails={columns[8]}>
        <IconButton
          id="employee-action-menu-button"
          ref={anchorEl}
          onClick={handleToggleNumberPerPageMenu(true)}
          sx={{padding: 0}}>
          <MoreVertOutlinedIcon />
        </IconButton>

        <Menu
          open={open}
          anchorEl={anchorEl.current}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          onClose={handleToggleNumberPerPageMenu(false)}>
          <Actions
            id={employeeDetails.employeeId}
            email={employeeDetails.email}
            onClose={() => setOpen(false)}
          />
        </Menu>
      </Cell>
    </TableRow>
  );
};

export default EmployeeRow;
