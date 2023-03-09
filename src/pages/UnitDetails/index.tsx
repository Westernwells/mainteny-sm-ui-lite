import {useContext, useLayoutEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import PaymentsIcon from '@mui/icons-material/Payments';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ListIcon from '@mui/icons-material/ListAlt';
import Delete from '@mui/icons-material/Delete';
import {Invoices} from 'pages/Invoices';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {Confirm} from 'components/Confirm';
import {LanguageContext} from 'context/LanguageProvider';
import {useTranslation} from 'react-i18next';
import {useDeleteElevator} from 'hooks/reactQuery/useElevator';
import {OverviewTab} from './Tabs/OverviewTab';
import {ServiceHistoryTab} from './Tabs/ServiceHistoryTab';
import {TodosTab} from './Tabs/TodosTab';
import {PerformanceTab} from './Tabs/PerformanceTab';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Service Orders',
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
      getCurrentPageTitle(`${t('Manufacturer')} - ${unitName}`);
    }
  }, [unitName, language]);

  return (
    <>
      <Tabs
        tabItems={tabItems}
        currentIndex={value}
        showActionBtn
        btnLabel="Delete Unit"
        onChange={(index) => setValue(index)}
        actionBtnVariant="outlined"
        disableBtnAction={isDeleting}
        actionButtonIcon={<Delete color="primary" />}
        btnOnClick={() => setOpenDeleteConfirm(true)}>
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
