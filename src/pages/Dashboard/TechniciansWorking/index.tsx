import {useWorkingEmployeeSummary} from '../../../hooks/reactQuery/useEmployee';
import {toRestDateTime} from '../../../utils/datetime';
import {Role} from '../../../models/user';
import TechniciansWorkingStateless, * as StatelessComponent from './TechniciansWorking';

type Props = Omit<
  StatelessComponent.Props,
  'workingNumberOfTechnicians' | 'isLoadingEmployeeSummary'
>;

const TechniciansWorking = (props: Props) => {
  const {data: summary, isLoading: isLoadingEmployeeSummary} =
    useWorkingEmployeeSummary({
      time: toRestDateTime(new Date()),
      employeeType: [Role.TECHNICIAN],
    });

  return (
    <TechniciansWorkingStateless
      workingNumberOfTechnicians={summary?.numberOfAvailableEmployees}
      isLoadingEmployeeSummary={isLoadingEmployeeSummary}
      {...props}
    />
  );
};

export default TechniciansWorking;
