import {useLayoutEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ListIcon from '@mui/icons-material/ListAlt';
import Delete from '@mui/icons-material/Delete';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {Confirm} from 'components/Confirm';
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
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const {mutateAsync: deleteElevator, isLoading: isDeleting} =
    useDeleteElevator('Unit deleted successfully');
  const [unitName, setUnitName] = useState('');

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(unitName);
    }
  }, [unitName]);

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
          <PerformanceTab />
        </TabsBody>

        <TabsBody value={value} index={3}>
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
