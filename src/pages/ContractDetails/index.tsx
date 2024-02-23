import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import ElevatorIcon from '@mui/icons-material/Elevator';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {ReactComponent as Invoices} from 'assets/icons/contract-invoices.svg';
import {useContractDetails} from 'hooks/reactQuery/useContract';
import {useParams} from 'react-router-dom';
import {SelectModal} from 'components/SelectModal';
import {UnitsTab} from './Tabs/UnitsTab';
import {ContractOverview} from './Tabs/ContractOverview';
import {AddUnitsDataGrid} from './AddUnitsDataGrid';
import CustomerNotes from '../CustomerDetails/Notes';
import InvoicesTab from './Tabs/Invoices/InvoicesTab';

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Units',
    icon: <ElevatorIcon />,
  },
  {
    label: 'Invoices',
    icon: <Invoices />,
  },
];

export const ContractDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openSelectUnitModal, setOpenSelectUnitModal] = useState(false);
  const {id: contractId} = useParams();
  const {data: contractDetails, isLoading} = useContractDetails(contractId!);

  const renderButtons = () => {
    if (contractDetails?.propertyOwner?.id) {
      return <CustomerNotes customerId={contractDetails?.propertyOwner?.id} />;
    }
    return null;
  };

  return (
    <>
      <Tabs
        tabItems={tabItems}
        currentIndex={tabValue}
        onChange={(index) => setTabValue(index)}
        showMenuActionBtn
        hideDivider
        // btnLabel="Download Contract"
        // btnOnClick={() => {
        //   if (downloadUrl && Object.values(downloadUrl).length) {
        //     const uploadUrl = Object.values(downloadUrl)[0];
        //     fetch(uploadUrl).then((response) =>
        //       response.blob().then((file) => {
        //         const link = document.createElement('a');
        //         link.href = URL.createObjectURL(file);
        //         link.setAttribute('download', fileName);
        //         link.click();
        //       }),
        //     );
        //   }
        // }}
        secondaryBtn={renderButtons()}>
        <TabsBody value={tabValue} index={0}>
          <ContractOverview
            contractDetails={contractDetails!}
            isLoading={isLoading}
          />
        </TabsBody>
        <TabsBody value={tabValue} index={1}>
          <UnitsTab
            elevators={contractDetails?.elevators || []}
            setOpenSelectUnitModal={setOpenSelectUnitModal}
          />
        </TabsBody>
        <TabsBody value={tabValue} index={2}>
          <InvoicesTab contractId={contractDetails?.id} />
        </TabsBody>
      </Tabs>
      <SelectModal
        isOpen={openSelectUnitModal}
        onClose={() => setOpenSelectUnitModal(false)}
        header="Select Unit">
        <AddUnitsDataGrid
          propertyOwnerId={contractDetails?.propertyOwner.id ?? ''}
          selectedElevators={
            contractDetails?.elevators?.map((i) => i.elevator.id) ?? []
          }
          onConfirm={() => setOpenSelectUnitModal(false)}
        />
      </SelectModal>
    </>
  );
};

export default ContractDetails;
