import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import React, {useState} from 'react';
import {ServiceOrderType, ServiceOrderLabels} from 'models/service-order';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {useTranslation} from 'react-i18next';
import InvoiceArticlesTable from './InvoiceArticlesTable';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const tabItems = Object.values(ServiceOrderType);

const TabPanel = (props: TabPanelProps) => {
  const {children, value, index, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{flexGrow: 1}}
      {...other}>
      {value === index && (
        <Box sx={{width: '100%', height: '100%', flexGrow: 1}}>{children}</Box>
      )}
    </div>
  );
};

const InvoiceArticles = () => {
  const {t} = useTranslation();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        bgcolor: '#F7F9FC',
        height: '100%',
        display: 'flex',
        gap: 4,
        border: '1px solid rgba(15, 76, 100, 0.08)',
        borderRadius: '4px',
        padding: '1rem',
      }}>
      <Tabs
        orientation="vertical"
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          '& [role="tablist"]': {
            position: 'relative',
            zIndex: 2,
          },
          '& button[aria-selected="true"] .label': {
            fontWeight: 'bold',
          },
        }}
        TabIndicatorProps={{
          sx: {
            background: '#0F4C6414',
            zIndex: 1,
            width: '100%',
            borderRadius: '4px',
          },
        }}>
        {tabItems.map((serviceOrder, index) => (
          <Tab
            key={index}
            sx={{textTransform: 'none', color: 'initial'}}
            label={
              <Box display="flex" alignItems="center" gap={1} width="100%">
                <ServiceOrderIcons serviceOrderType={serviceOrder} />
                <span className="label">
                  {t(ServiceOrderLabels[serviceOrder])}
                </span>
              </Box>
            }
          />
        ))}
      </Tabs>
      {tabItems.map((serviceOrder, index) => (
        <TabPanel key={index} value={tabValue} index={index}>
          <InvoiceArticlesTable serviceOrderType={serviceOrder} />
        </TabPanel>
      ))}
    </Box>
  );
};

export default InvoiceArticles;
