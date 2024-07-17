import {useContext, useLayoutEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import PaymentsIcon from '@mui/icons-material/Payments';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ListIcon from '@mui/icons-material/ListAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import {Invoices} from 'pages/Invoices';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {Confirm} from 'components/Confirm';
import {LanguageContext} from 'context/LanguageProvider';
import {useTranslation} from 'react-i18next';
import {useDeleteElevator} from 'hooks/reactQuery/useElevator';
import {theme} from 'theme';
import Box from '@mui/material/Box';
import {Button} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import RefreshIcon from '@mui/icons-material/Refresh';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import UploadIcon from '@mui/icons-material/Upload';
import HandymanIcon from '@mui/icons-material/Handyman';
import {ServiceOrderType} from 'models/service-order';
import {
  serviceOrderTypeColor,
  serviceOrderTypeToString,
} from 'utils/service-order-utils';
import {OverviewTab} from './Tabs/OverviewTab';
import {ServiceHistoryTab} from './Tabs/ServiceHistoryTab';
import {TodosTab} from './Tabs/TodosTab';
import {PerformanceTab} from './Tabs/PerformanceTab';
import UnitNotes from './Notes';
import TechnicalDataTab from './Tabs/TechnicalDataTab';

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
    label: "To-Do's",
    icon: <ListIcon />,
  },
];

enum TabIndex {
  OVERVIEW = 0,
  TECHNICAL_DATA = 1,
  SERVICE_HISTORY = 2,
  INVOICE_HISTORY = 3,
  PERFORMANCE = 4,
  TODOS = 5,
}

export const UnitsDetail = ({getCurrentPageTitle}: Props) => {
  const [value, setValue] = useState<TabIndex>(TabIndex.OVERVIEW);
  const {id: elevatorId} = useParams();
  const {t} = useTranslation();
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

  const menu = [
    {
      label: serviceOrderTypeToString(ServiceOrderType.EMERGENCY),
      action: () =>
        track(() =>
          navigate(`/orders/new?type=emergency&elevatorId=${elevatorId}`),
        ),
      icon: (
        <ReportProblemIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.EMERGENCY)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.CALLOUT),
      action: () =>
        track(() =>
          navigate(`/orders/new?type=callout&elevatorId=${elevatorId}`),
        ),
      icon: (
        <PhoneInTalkIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.CALLOUT)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.REPAIR),
      action: () =>
        track(() =>
          navigate(`/orders/new?type=repair&elevatorId=${elevatorId}`),
        ),
      icon: (
        <SettingsIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.REPAIR)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.REGULAR),
      action: () =>
        track(() =>
          navigate(`/orders/new?type=regular&elevatorId=${elevatorId}`),
        ),
      icon: (
        <RefreshIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.REGULAR)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.INSPECTION),
      action: () =>
        track(() =>
          navigate(`/orders/new?type=inspection&elevatorId=${elevatorId}`),
        ),
      icon: (
        <YoutubeSearchedForIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.INSPECTION)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.NEW_INSTALLATION),
      action: () =>
        track(() =>
          navigate(
            `/orders/new?type=new_installation&elevatorId=${elevatorId}`,
          ),
        ),
      icon: (
        <BuildCircleIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.NEW_INSTALLATION)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.MODERNIZATION),
      action: () =>
        track(() =>
          navigate(`/orders/new?type=modernization&elevatorId=${elevatorId}`),
        ),
      icon: (
        <UploadIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.MODERNIZATION)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.GENERAL),
      action: () =>
        track(() =>
          navigate(`/orders/new?type=general&elevatorId=${elevatorId}`),
        ),
      icon: (
        <HandymanIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.GENERAL)}}
        />
      ),
    },
  ];

  return (
    <>
      <Tabs
        hideBackIcon
        tabItems={tabItems}
        hideDivider
        showMenuActionBtn
        menu={menu}
        btnLabel="Create Job"
        currentIndex={value}
        onChange={(index) => setValue(index)}
        containerStyles={{
          marginBottom: theme.spacing(8),
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
          <Invoices elevatorId={elevatorId} />
        </TabsBody>

        <TabsBody value={value} index={TabIndex.PERFORMANCE}>
          <PerformanceTab />
        </TabsBody>

        <TabsBody value={value} index={TabIndex.TODOS}>
          <TodosTab />
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
