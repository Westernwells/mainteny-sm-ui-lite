import {useParams} from 'react-router-dom';
import {useLayoutEffect, useState} from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import {Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import {useGetUserAccount} from 'hooks/reactQuery/useUserAccount';
import {EmployeeOverview} from './Tabs/EmployeeOverview';
import {ScheduleTab} from './Tabs/ScheduleTab';
import WorkHoursTab from './Tabs/WorkHours';

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
    label: 'Work Hours',
    icon: <TimerOutlinedIcon />,
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
        <EmployeeOverview
          employee={user}
          isLoading={isLoading}
          openWorkHoursTab={() => setTabValue(2)}
        />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <ScheduleTab technicianId={user?.userData.employeeId} />
      </TabsBody>
      <TabsBody value={tabValue} index={2}>
        <WorkHoursTab employeeId={employeeId || ''} />
      </TabsBody>
    </Tabs>
  );
};
