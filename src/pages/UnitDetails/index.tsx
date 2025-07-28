import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import PaymentsIcon from '@mui/icons-material/Payments';
import SettingsIcon from '@mui/icons-material/Settings';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import {Button} from '@mui/material';
import Box from '@mui/material/Box';
import {Confirm} from 'components/Confirm';
import {Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import {LanguageContext} from 'context/LanguageProvider';
import {useCompanyJobTypes} from 'hooks/reactQuery/useCompanies';
import {useDeleteElevator, useElevatorById} from 'hooks/reactQuery/useElevator';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import Invoices from 'pages/Invoices';
import {iconMapping} from 'pages/ServiceOrders';
import {useContext, useLayoutEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router';
import {theme} from 'theme';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import UnitNotes from './Notes';
import {OverviewTab} from './Tabs/OverviewTab';
import {PerformanceTab} from './Tabs/PerformanceTab';
import {ServiceHistoryTab} from './Tabs/ServiceHistoryTab';
import TechnicalDataTab from './Tabs/TechnicalDataTab';
import TasksTab from './Tabs/TasksTab';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Technical Data',
    icon: <SettingsIcon />,
  },
  {
    label: 'Service Jobs',
    icon: <EngineeringOutlinedIcon />,
  },
  {
    label: 'Invoice history',
    icon: <PaymentsIcon />,
  },
  {
    label: 'Performance',
    icon: <GraphicEqIcon />,
  },
  {
    label: 'Tasks',
    icon: <RuleOutlinedIcon />,
  },
];

enum TabIndex {
  OVERVIEW = 0,
  TECHNICAL_DATA = 1,
  SERVICE_HISTORY = 2,
  INVOICE_HISTORY = 3,
  PERFORMANCE = 4,
  TASKS = 5,
}

export const UnitsDetail = ({getCurrentPageTitle}: Props) => {
  const [value, setValue] = useState<TabIndex>(TabIndex.OVERVIEW);
  const {id: elevatorId} = useParams();

  const {data: elevator} = useElevatorById(elevatorId);
  const {t} = useTranslation();
  const {user} = useUserSession();
  const {data: jobTypes, isLoading: loading} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const {language} = useContext(LanguageContext);
  const {mutateAsync: deleteElevator, isLoading: isDeleting} =
    useDeleteElevator('Unit deleted successfully');
  const [unitName, setUnitName] = useState('');
  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(`${t('Unit Details')} - ${unitName}`);
    }
  }, [unitName, language]);

  const track = (cb: () => void) => {
    cb();
  };

  const menu = useMemo(() => {
    if (loading || !jobTypes) return [];

    return jobTypes.map((jobType) => {
      const IconComponent =
        iconMapping[jobType.icon as keyof typeof iconMapping] ||
        HelpOutlineOutlinedIcon;

      return {
        label:
          serviceOrderTypeToString(jobType?.givenName!) === '-'
            ? jobType?.givenName!
            : t(serviceOrderTypeToString(jobType?.givenName!)),
        action: () =>
          track(() => {
            navigate(
              `/orders/new?type=${encodeURIComponent(
                jobType.name,
              )}&elevatorId=${elevatorId}`,
            );
          }),
        icon: <IconComponent fontSize="small" />,
      };
    });
  }, [jobTypes, loading]);

  return (
    <>
      <Tabs
        hideBackIcon
        tabItems={tabItems}
        showMenuActionBtn
        menu={menu}
        hideDivider
        btnLabel="Create Job"
        currentIndex={value}
        onChange={(index) => setValue(index)}
        containerStyles={{
          marginBottom:
            value === TabIndex.TASKS ? theme.spacing(4) : theme.spacing(8),
          '& > div:first-of-type': {marginBottom: theme.spacing(2)},
        }}>
        <TabsBody value={value} index={TabIndex.OVERVIEW}>
          <OverviewTab getUnitName={(name) => setUnitName(name)} />
        </TabsBody>

        <TabsBody value={value} index={TabIndex.TECHNICAL_DATA}>
          <TechnicalDataTab />
        </TabsBody>

        <TabsBody value={value} index={TabIndex.SERVICE_HISTORY}>
          <ServiceHistoryTab />
        </TabsBody>

        <TabsBody value={value} index={TabIndex.INVOICE_HISTORY}>
          <Invoices
            elevatorId={elevatorId}
            customerId={elevator?.propertyOwner.id}
            elevatorExternalId={elevator?.externalId}
          />
        </TabsBody>

        <TabsBody value={value} index={TabIndex.PERFORMANCE}>
          <PerformanceTab />
        </TabsBody>

        <TabsBody
          containerStyle={{
            height: '1px',
            overflow: 'auto',
            marginTop: 1,
            backgroundColor: 'white',
            padding: 3,
          }}
          value={value}
          index={TabIndex.TASKS}>
          <TasksTab elevatorId={elevatorId!} />
        </TabsBody>
        <Box
          sx={{
            position: 'fixed',
            left: `calc(${theme.spacing(7)} - 1px)`,
            [theme.breakpoints.up('sm')]: {
              left: `calc(${theme.spacing(9)} - 1px)`,
            },
            right: 0,
            bottom: 0,
            background: theme.palette.background.paper,
            boxShadow: theme.shadows[3],
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.6rem 2rem',
          }}>
          <Button
            disabled={isDeleting}
            onClick={() => setOpenDeleteConfirm(true)}
            startIcon={
              <DeleteOutlineIcon style={{color: theme.palette.error.main}} />
            }
            color="error">
            {t('Delete Unit')}
          </Button>
          <UnitNotes elevatorId={elevatorId!} />
        </Box>
      </Tabs>
      <Confirm
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          const response = await deleteElevator(elevatorId!);
          if (response.value) {
            navigate('/units/', {replace: true});
          }
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Confirm"
        content="Do you want to delete this unit?"
      />
    </>
  );
};

export default UnitsDetail;
