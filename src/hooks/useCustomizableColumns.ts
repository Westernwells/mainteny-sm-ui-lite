import {CustomizableColumn, CustomizableTable} from 'models/table';
import {
  useQueryClientStorageData,
  useUpdateServiceCompanyClientStorage,
} from 'hooks/useClientStorage';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useMemo} from 'react';

const useCustomizableColumns = (
  table: CustomizableTable,
  allColumns: CustomizableColumn[],
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user!.userAccount.serviceCompany.id;

  const key = `users/${
    user?.userAccount.id
  }/profile/table/${table.toLowerCase()}`;

  const {data: clientStorageData} = useQueryClientStorageData({
    serviceCompanyId,
    params: {key},
  });

  const {mutateAsync: updateClientStorage} =
    useUpdateServiceCompanyClientStorage();

  const handleUpdate = (dataToSave: string[]) =>
    updateClientStorage({
      body: {
        key,
        value: dataToSave.join(','),
      },
      serviceCompanyId,
    });

  const customizedTableColumns = useMemo(
    () =>
      clientStorageData?.value !== ''
        ? clientStorageData?.value?.split(',')
        : null,
    [clientStorageData],
  );
  const handleToggle = (
    value: CustomizableColumn,
    selectedTableColumns: string[],
    action: 'add' | 'remove',
  ) => {
    const dataToSave =
      action === 'remove'
        ? selectedTableColumns.filter((column) => column !== value.id)
        : [...selectedTableColumns, value.id];

    handleUpdate(dataToSave);
  };

  const defaultColumns = useMemo(
    () =>
      allColumns.reduce((acc, column: CustomizableColumn) => {
        if (column.default && !column.fixed) {
          return [...acc, column.id];
        }
        return acc;
      }, [] as string[]),
    [allColumns],
  );

  const selectedTableColumns = useMemo(
    () => customizedTableColumns || defaultColumns,
    [customizedTableColumns, defaultColumns],
  );

  const fixedTableColumns = useMemo(
    () => allColumns.filter((column) => column.fixed),
    [allColumns],
  );

  return {
    selectedTableColumns,
    fixedTableColumns,
    defaultColumns,
    updateClientCustomizedTableData: handleUpdate,
    onToggle: handleToggle,
  };
};

export default useCustomizableColumns;
