import {useLayoutEffect, useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {useParams} from 'react-router';
import {useGetUserAccount} from 'hooks/reactQuery/useUserAccount';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {EmployeeOverview} from './Tabs/EmployeeOverview';
import {ScheduleTab} from './Tabs/ScheduleTab';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

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

export const EmployeeDetails = ({getCurrentPageTitle}: Props) => {
  const [tabValue, setTabValue] = useState(0);
  const {id: employeeId} = useParams();
  const {data: user, isLoading} = useGetUserAccount(employeeId);

  useLayoutEffect(() => {
    if (getCurrentPageTitle && user) {
      getCurrentPageTitle(
        `${user?.userAccount.firstName} ${user?.userAccount.lastName}`,
      );
    }
  }, [user]);

  return (
    <Tabs
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => setTabValue(index)}>
      <TabsBody value={tabValue} index={0}>
        <EmployeeOverview employee={user} isLoading={isLoading} />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <ScheduleTab technicianId={user?.userData.employeeId} />
        {/* <Schedule technicianId={technician && technician[0].id} /> */}
      </TabsBody>
      <TabsBody value={tabValue} index={2}>
        {null}
      </TabsBody>
    </Tabs>
  );
};
