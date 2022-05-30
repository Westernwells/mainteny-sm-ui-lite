import {useEffect, useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {useParams} from 'react-router';
import {useGetUserAccount} from 'hooks/reactQuery/useUserAccount';
import {useGetTechnician} from 'hooks/reactQuery/useTechnician';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {Role} from 'models/user';
import {EmployeesView} from 'models/employee';
import {EmployeeOverview} from './Tabs/EmployeeOverview';
import {ScheduleTab} from './Tabs/ScheduleTab';

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Schedule',
    icon: <CalendarTodayIcon />,
  },
  {
    label: 'Holiday',
    icon: <WbSunnyIcon />,
  },
];

export const EmployeeDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const {id: username} = useParams();
  const {data: userAccount, isLoading} = useGetUserAccount(username);
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
        <EmployeeOverview employee={employee} isLoading={isLoading} />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <ScheduleTab technicianId={technician && technician[0].id} />
        {/* <Schedule technicianId={technician && technician[0].id} /> */}
      </TabsBody>
      <TabsBody value={tabValue} index={2}>
        {null}
      </TabsBody>
    </Tabs>
  );
};
