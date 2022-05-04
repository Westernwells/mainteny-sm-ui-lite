import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {CustomButtonUnstyled} from 'components/CustomButtonUnstyled';
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
      backBtnLabel="Contract Details"
      renderWidget={
        <CustomButtonUnstyled
          label="Download Contract"
          size="medium"
          startIcon={<FileDownloadIcon color="primary" />}
        />
      }>
      <TabsBody value={tabValue} index={0}>
        <ContractOverview />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <UnitsTab />
      </TabsBody>
    </Tabs>
  );
};
