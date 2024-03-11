import {useContext, useLayoutEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import PaymentsIcon from '@mui/icons-material/Payments';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ListIcon from '@mui/icons-material/ListAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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
import {OverviewTab} from './Tabs/OverviewTab';
import {ServiceHistoryTab} from './Tabs/ServiceHistoryTab';
import {TodosTab} from './Tabs/TodosTab';
import {PerformanceTab} from './Tabs/PerformanceTab';
import UnitNotes from './Notes';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
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

export const UnitsDetail = ({getCurrentPageTitle}: Props) => {
  const [value, setValue] = useState(0);
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

  return (
    <>
      <Tabs
        tabItems={tabItems}
        currentIndex={value}
        showActionBtn
        hideDivider
        btnLabel="Create Job"
        onChange={(index) => setValue(index)}
        disableBtnAction={isDeleting}
        // TODO: Add onClick event to the button
        btnOnClick={() => console.log('Create Job')}
        containerStyles={{
          marginBottom: theme.spacing(8),
          '& > div:first-child': {marginBottom: theme.spacing(2)},
        }}>
        <TabsBody value={value} index={0}>
          <OverviewTab getUnitName={(name) => setUnitName(name)} />
        </TabsBody>

        <TabsBody value={value} index={1}>
          <ServiceHistoryTab />
        </TabsBody>

        <TabsBody value={value} index={2}>
          <Invoices elevatorId={elevatorId} />
        </TabsBody>

        <TabsBody value={value} index={3}>
          <PerformanceTab />
        </TabsBody>

        <TabsBody value={value} index={4}>
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
