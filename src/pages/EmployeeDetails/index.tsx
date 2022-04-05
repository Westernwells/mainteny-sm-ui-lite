import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import ElevatorIcon from '@mui/icons-material/Elevator';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {useParams} from 'react-router';
import {useGetUserAccount} from 'hooks/reactQuery/useUserAccount';
import {useGetTechnician} from 'hooks/reactQuery/useTechnician';
import {Role} from 'models/user';
import {EmployeesView} from 'models/employee';
import {EmployeeOverview} from './Tabs/EmployeeOverview';

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Schedule',
    icon: <ElevatorIcon />,
  },
  {
    label: 'Contracts',
    icon: <FileCopyIcon />,
  },
];

export const EmployeeDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const {id: username} = useParams();
  const {data: userAccount} = useGetUserAccount(username);
  const [employee, setEmployee] = useState<EmployeesView>();
  const {data: technician} = useGetTechnician(
    userAccount && userAccount.roles.includes(Role.TECHNICIAN)
      ? userAccount.username
      : null,
  );
  useEffect(() => {
    let userData: EmployeesView | undefined;
    if (
      userAccount &&
      userAccount.roles.includes(Role.TECHNICIAN) &&
      technician
    ) {
      userData = {...technician[0]};
    } else {
      userData = userAccount && {userAccount};
    }

    setEmployee(userData);
  }, [technician, userAccount]);

  return (
    <Box>
      <Tabs
        tabItems={tabItems}
        currentIndex={tabValue}
        onChange={(index) => setTabValue(index)}
        backBtnLabel={
          employee
            ? `${employee?.userAccount.firstName} 
              
              ${employee?.userAccount.lastName}`
            : ''
        }>
        <TabsBody value={tabValue} index={0}>
          <EmployeeOverview employee={employee} />
        </TabsBody>
        <TabsBody value={tabValue} index={1}>
          {null}
        </TabsBody>
        <TabsBody value={tabValue} index={2}>
          {null}
        </TabsBody>
      </Tabs>
    </Box>
  );
};
