import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab-old';
import {Button} from 'components/Button';
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
        <Button
          label="Download Contract"
          style={{
            textTransform: 'capitalize',
            background: 'transparent',
            border: '1px solid rgba(15, 76, 100, 0.5)',
            px: '1.5em',
            '&:hover': {
              background: 'transparent',
            },
          }}
          buttonProps={{
            startIcon: <FileDownloadIcon color="primary" sx={{}} />,
          }}
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
