import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
// import {Button} from 'components/Button';
import ElevatorIcon from '@mui/icons-material/Elevator';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useContractDetails} from 'hooks/reactQuery/useContract';
import {useParams} from 'react-router';
import {useSnackbar} from 'notistack';
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
  const {enqueueSnackbar} = useSnackbar();

  const {data: downloadUrl} = useDownloadUrl(
    contractDetails?.additionalInfo?.documents?.length
      ? [contractDetails?.additionalInfo?.documents[0]?.uri]
      : [],
  );
  /*eslint-disable*/
  return (
    <Tabs
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => setTabValue(index)}
      showActionBtn
      btnLabel="Download contract"
      actionBtnVariant="outlined"
      actionButtonIcon={<FileDownloadIcon color="primary" sx={{}} />}
      btnOnClick={() => {
        if (downloadUrl && Object.values(downloadUrl).length) {
          return window.open(Object.values(downloadUrl!)[0], '_blank');
        }
        enqueueSnackbar(
          'Sorry, no document has been attached to this contract yet!',
          {
            variant: 'error',
          },
        );
      }}>
      <TabsBody value={tabValue} index={0}>
        <ContractOverview
          contractDetails={contractDetails!}
          isLoading={isLoading}
        />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <UnitsTab />
      </TabsBody>
    </Tabs>
  );
};
