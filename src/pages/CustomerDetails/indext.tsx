import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {BackAction} from 'components/BackAction';
import {CardProps} from 'components/CardProps';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import useTheme from '@mui/material/styles/useTheme';
import {BasicDetailsCard} from 'components/BasicDetailsCard';
import Typography from '@mui/material/Typography';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import {GridRowsProp} from '@mui/x-data-grid';
import {staticContracts, contractWithUnits} from 'pages/Contracts/data';
import {DataGridLayout} from 'components/DataGridLayout';
import {columns, makeRows} from 'pages/Contracts/ContractsDataGridProps';
import {createEmptyResource} from 'utils/paging-utils';
import {ContractView} from 'models/contract';
import {CustomerDetailsWidgets} from './CustomerDetailsWidgets';

export const CustomerDetails = () => {
  const theme = useTheme();
  const [_expiryDate, setExpiryDate] = useState<string[]>([]);
  const [showFilter] = useState(false);
  const [_contractor, setContractor] = useState<string[]>([]);
  const [_cost, setCost] = useState<number[][]>([]);
  const [contractorFilterItems, setConractorFileterItems] = useState<string[]>(
    [],
  );
  const [rows, setRows] = useState<GridRowsProp>([]);
  const {data: contractResource = createEmptyResource<ContractView>(10)} =
    staticContracts;

  console.log(_expiryDate, _contractor, _cost, contractResource);

  useEffect(() => {
    const options: string[] = [];
    console.log('test');

    if (contractWithUnits) {
      // TODO: Resolve 'any' here
      contractWithUnits?.forEach((item: any) => {
        if (
          !options.includes(item.serviceCompany.name) &&
          !contractorFilterItems.includes(item.serviceCompany.name)
        ) {
          options.push(item.serviceCompany.name);
        }
      });
      setRows(makeRows(contractWithUnits));
    } else {
      setRows([]);
    }
    setConractorFileterItems([...contractorFilterItems, ...options]);
    if (!showFilter) {
      setExpiryDate([]);
      setContractor([]);
      setCost([]);
    }
  }, [contractWithUnits, showFilter]);
  return (
    <Box>
      <BackAction label="Customer Details" />
      <BasicDetailsCard
        minHeight="12rem"
        headerStyles={{pb: '0'}}
        header={<Typography variant="subtitle1">#785371</Typography>}>
        <Box display="flex" flexWrap="wrap">
          <CardProps
            label="CUSTOMER NAME"
            bodyTextVariant="subtitle1"
            icon={<HomeWorkIcon sx={{color: theme.palette.info.dark}} />}
            containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText="Hotel NH Berlin City"
          />

          <CardProps
            label="PHONE NUMBER"
            bodyTextVariant="subtitle1"
            icon={<LocalPhoneIcon sx={{color: theme.palette.info.dark}} />}
            containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText="+49 30 557570"
          />

          <CardProps
            label="CUSTOMER SINCE"
            bodyTextVariant="subtitle1"
            icon={<WorkIcon sx={{color: theme.palette.info.dark}} />}
            containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText="21 June, 2020"
          />

          <CardProps
            label="ADDRESS"
            bodyTextVariant="subtitle1"
            icon={<HomeIcon sx={{color: theme.palette.info.dark}} />}
            containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText="Rathausstraße 2-3, 10367 Berlin"
          />

          <CardProps
            label="EMAIL ID"
            bodyTextVariant="subtitle1"
            icon={<EmailIcon sx={{color: theme.palette.info.dark}} />}
            containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3rem"
            bodyText="johncranston@hotelnh.com"
          />
        </Box>
      </BasicDetailsCard>

      <CustomerDetailsWidgets containerStyle={{mt: '1em', mb: '1.5em'}} />
      <DataGridLayout rows={rows} columns={columns} />
    </Box>
  );
};
