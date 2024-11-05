import {FormSelect} from 'components/form/FormSelect';
import {useCompanyJobTypes} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {serviceOrderTypeToString} from 'utils/service-order-utils';

interface Props {
  value: string;
  onChange: (e: any) => void;
}

export const CreateServiceOrder = ({value, onChange}: Props) => {
  const {user} = useUserSession();

  const {data: jobTypes} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  return (
    <FormSelect
      labelId="createServiceOrder-label"
      label="Job Type"
      required
      options={jobTypes?.map((i) => ({
        label:
          serviceOrderTypeToString(i.name) === '-'
            ? i.name
            : serviceOrderTypeToString(i.name),
        value: i.name,
      }))}
      selectProps={{
        id: 'createServiceOrder',
        value,
        onChange,
        name: 'createServiceOrder',
      }}
    />
  );
};
