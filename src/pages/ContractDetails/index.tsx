import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import ElevatorIcon from '@mui/icons-material/Elevator';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useContractDetails} from 'hooks/reactQuery/useContract';
import {useParams} from 'react-router';
import {UnitsTab} from './Tabs/UnitsTab';
import {ContractOverview} from './Tabs/ContractOverview';

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
  const {id: contractId} = useParams();
  const {data: contractDetails, isLoading} = useContractDetails(contractId!);

  const {data: downloadUrl} = useDownloadUrl(
    contractDetails?.additionalInfo?.documents?.length
      ? [contractDetails?.additionalInfo?.documents[0]?.uri]
      : [],
  );

  return (
    <Tabs
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => setTabValue(index)}
      showActionBtn
      btnLabel="Download contract"
      actionBtnVariant="outlined"
      disableBtnAction={!Object.values(downloadUrl || {}).length}
      actionButtonIcon={<FileDownloadIcon color="primary" sx={{}} />}
      btnOnClick={() => {
        if (downloadUrl && Object.values(downloadUrl).length) {
          const url = Object.values(downloadUrl)[0];
          fetch(url).then((t) =>
            t.blob().then((b) => {
              const a = document.createElement('a');
              a.href = URL.createObjectURL(b);
              a.setAttribute('download', 'contract');
              a.click();
            }),
          );
        }
      }}>
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
  );
};
