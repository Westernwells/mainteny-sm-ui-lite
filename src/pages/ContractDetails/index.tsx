import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import ElevatorIcon from '@mui/icons-material/Elevator';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {ReactComponent as Invoices} from 'assets/icons/contract-invoices.svg';
import {useContractDetails} from 'hooks/reactQuery/useContract';
import {useParams} from 'react-router-dom';
import {SelectModal} from 'components/SelectModal';
import {UnitsTab} from './Tabs/Unit/UnitsTab';
import {ContractOverview} from './Tabs/ContractOverview';
import {AddUnitsDataGrid} from './AddUnitsDataGrid';
import InvoicesTab from './Tabs/Invoices/InvoicesTab';
import {Notes} from './Notes';
import {OldContractData} from './Tabs/ContractOverview/OldContractData';

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
  {
    label: 'Old Contract Data',
    icon: <ManageSearchIcon />,
  },
];

export const ContractDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openSelectUnitModal, setOpenSelectUnitModal] = useState(false);
  const {id: contractId} = useParams();
  const {data: contractDetails, isLoading} = useContractDetails(contractId!);

  const renderButtons = () => {
    if (contractDetails?.propertyOwner?.id) {
      return <Notes contract={contractDetails!} />;
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
        secondaryBtn={renderButtons()}>
        <TabsBody value={tabValue} index={0}>
          <ContractOverview
            contractDetails={contractDetails!}
            isLoading={isLoading}
          />
        </TabsBody>
        <TabsBody value={tabValue} index={1}>
          <UnitsTab
            contractId={contractDetails?.id}
            setOpenSelectUnitModal={setOpenSelectUnitModal}
            elevatorsLength={contractDetails?.elevators?.length}
          />
        </TabsBody>
        <TabsBody value={tabValue} index={2}>
          <InvoicesTab contractId={contractDetails?.id} />
        </TabsBody>
        <TabsBody value={tabValue} index={3}>
          <OldContractData
            contractDetails={contractDetails!}
            isLoading={isLoading}
          />
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
