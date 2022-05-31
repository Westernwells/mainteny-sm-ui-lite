import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
// import {Button} from 'components/Button';
import ElevatorIcon from '@mui/icons-material/Elevator';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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
  return (
    <Tabs
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => setTabValue(index)}
      showActionBtn
      btnLabel="Download contract"
      actionBtnVariant="outlined"
      actionButtonIcon={<FileDownloadIcon color="primary" sx={{}} />}>
      <TabsBody value={tabValue} index={0}>
        <ContractOverview />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <UnitsTab />
      </TabsBody>
    </Tabs>
  );
};
