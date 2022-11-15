import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import ElevatorIcon from '@mui/icons-material/Elevator';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useContractDetails} from 'hooks/reactQuery/useContract';
import {useParams} from 'react-router-dom';
import {Button} from 'components/Button';
import {SelectModal} from 'components/SelectModal';
import {UnitsTab} from './Tabs/UnitsTab';
import {ContractOverview} from './Tabs/ContractOverview';
import {AddUnitsDataGrid} from './AddUnitsDataGrid';

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Units',
    icon: <ElevatorIcon />,
  },
];

export const ContractDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openSelectUnitModal, setOpenSelectUnitModal] = useState(false);
  const {id: contractId} = useParams();
  const {data: contractDetails, isLoading} = useContractDetails(contractId!);

  const {data: downloadUrl} = useDownloadUrl(
    contractDetails?.additionalInfo?.documents?.length
      ? [contractDetails?.additionalInfo?.documents[0]?.uri]
      : [],
  );

  const fileName =
    contractDetails?.additionalInfo?.documents &&
    contractDetails?.additionalInfo?.documents?.length > 0
      ? contractDetails?.additionalInfo?.documents[0]?.description
      : 'contract';

  return (
    <>
      <Tabs
        tabItems={tabItems}
        currentIndex={tabValue}
        onChange={(index) => setTabValue(index)}
        showActionBtn
        btnLabel="Download contract"
        actionBtnVariant="outlined"
        disableBtnAction={!Object.values(downloadUrl || {}).length}
        actionButtonIcon={<FileDownloadIcon color="primary" />}
        btnOnClick={() => {
          if (downloadUrl && Object.values(downloadUrl).length) {
            const uploadUrl = Object.values(downloadUrl)[0];
            fetch(uploadUrl).then((response) =>
              response.blob().then((file) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(file);
                link.setAttribute('download', fileName);
                link.click();
              }),
            );
          }
        }}
        secondaryBtn={
          tabValue === 1 ? (
            <Button
              label="Add Unit"
              buttonProps={{
                onClick: () => setOpenSelectUnitModal(true),
                variant: 'contained',
                sx: {
                  textTransform: 'capitalize',
                  ml: '0.8em',
                  height: '100%',
                },
                color: 'primary',
                size: 'large',
                startIcon: <AddIcon />,
              }}
            />
          ) : null
        }>
        <TabsBody value={tabValue} index={0}>
          <ContractOverview
            contractDetails={contractDetails!}
            isLoading={isLoading}
          />
        </TabsBody>
        <TabsBody value={tabValue} index={1}>
          <UnitsTab elevators={contractDetails?.elevators || []} />
        </TabsBody>
      </Tabs>
      <SelectModal
        isOpen={openSelectUnitModal}
        onClose={() => setOpenSelectUnitModal(false)}
        header="Select Unit">
        <AddUnitsDataGrid
          propertyOwnerId={contractDetails?.propertyOwner.id ?? ''}
        />
      </SelectModal>
    </>
  );
};
