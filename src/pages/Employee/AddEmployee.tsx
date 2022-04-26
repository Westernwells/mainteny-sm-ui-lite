import React, {ChangeEvent, useState} from 'react';
import {useFormik} from 'formik';
import Button from '@mui/material/Button';
import {SelectChangeEvent} from '@mui/material';
import {SideDrawer} from 'components/SideDrawer';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {ServiceOrderType} from 'models/service-order';
import {TimeWindowType} from 'models/misc';
import {convertToMacro, convertToText} from 'utils/utils';
import {AddEmployeeForm} from './AddEmployeeForm';
import {EmployeeAccountData, Shift} from './AddEmployeeForm/model';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddEmployee = ({open, setOpen}: Props) => {
  const {user} = useUserSession();

  const [roles, setRoles] = useState<string[]>([]);
  const [address, setAddress] = useState(null);

  const [orderTypes, setOrderTypes] = useState({
    REGULAR: {label: ServiceOrderType.REGULAR, checked: true},
    REPAIR: {label: ServiceOrderType.REPAIR, checked: true},
    EMERGENCY: {label: ServiceOrderType.EMERGENCY, checked: true},
    CALLOUT: {label: ServiceOrderType.CALLOUT, checked: true},
  });

  const [shifts, setShifts] = useState<Shift<Date | null>[]>([
    {
      fromTime: new Date(0, 0, 0, 7, 0),
      toTime: new Date(0, 0, 0, 18, 0),
      workDays: convertToText(TimeWindowType.WEEKDAY),
    },
  ]);

  const initialValues: EmployeeAccountData = {
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    password: '',
    roles,
    address,
    serviceOrderTypes: Object.values(orderTypes)
      .filter((item) => item.checked)
      .map((i) => i.label),
    shifts: shifts.map((item) => ({
      fromTime: item.fromTime?.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      toTime: item.toTime?.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      workDays: convertToMacro(item.workDays),
    })),
    serviceCompanyId: user?.userAccount.serviceCompany.id,
  };

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => console.log(values),
    enableReinitialize: true,
  });

  const handleRoleChange = (event: SelectChangeEvent<any>) => {
    const {
      target: {value},
    } = event;
    setRoles(typeof value === 'string' ? value.split(',') : value);
  };

  const handleCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    setOrderTypes({
      ...orderTypes,
      [event.target.name]: {
        checked: event.target.checked,
        label:
          ServiceOrderType[
            event.target.name as unknown as typeof ServiceOrderType.EMERGENCY
          ],
      },
    });
  };

  return (
    <SideDrawer
      open={open}
      setOpen={setOpen}
      header="Add Employee"
      footer={
        <Button
          variant="contained"
          type="submit"
          onClick={() => formik.handleSubmit()}>
          Add Employee
        </Button>
      }
      body={
        <AddEmployeeForm
          formikValues={formik.values}
          formikHandleChange={formik.handleChange}
          handleRoleChange={handleRoleChange}
          setAddress={setAddress}
          orderTypes={orderTypes}
          handleCheckbox={handleCheckbox}
          shifts={shifts}
          setShifts={setShifts}
        />
      }
    />
  );
};
