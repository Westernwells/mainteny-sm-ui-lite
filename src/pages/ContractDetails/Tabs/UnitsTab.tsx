import {Dispatch, FC, SetStateAction, useEffect, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';

import {DataGridLayout} from 'components/DataGridLayout';
import {makePage} from 'utils/paging-utils';
import {TabContentContainer} from 'components/TabContentContainer';
import {EmptySection} from 'components/EmptySection';
import {useNavigate} from 'react-router-dom';
import {useFormatDate} from 'hooks/useFormatDate';
import {ContractElevatorSimpleView} from 'models/contract';
import {ElevatorView} from 'models/elevator';
import {Typography} from '@mui/material';
import {Box} from '@mui/system';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import {Button} from 'components/Button';
import {columns, makeRows} from './UnitsDataGridProps';

interface Props {
  elevators: ContractElevatorSimpleView[];
  setOpenSelectUnitModal: Dispatch<SetStateAction<boolean>>;
}

export const UnitsTab: FC<Props> = ({elevators, setOpenSelectUnitModal}) => {
  const formatDate = useFormatDate();
  const {t} = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(makePage(0, 25)); // TODO: implement paging
  const [rows, setRows] = useState<GridRowsProp>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_pageCount, setPageCount] = useState(0);

  useEffect(() => {
    if (elevators.length) {
      setRows(
        makeRows(
          {
            elevators: elevators.map(
              (elevator) =>
                ({
                  ...elevator.elevator,
                } as ElevatorView),
            ),
          },
          formatDate,
        ),
      );
    }
  }, [elevators]);

  useEffect(() => {
    if (elevators) {
      setPageCount(Math.ceil(elevators.length / page.pageSize));
    }
  }, [elevators, page]);

  return (
    <TabContentContainer>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{pt: 3, pb: 3, backgroundColor: '#FFFFFF', mt: 3}}>
        <Typography
          sx={{pl: 2}}
          variant="h6"
          color={theme.palette.info.infoAlert}>
          {t('Units under the Contract')}
        </Typography>
        <Button
          label="Add Unit"
          buttonProps={{
            onClick: () => setOpenSelectUnitModal(true),
            sx: {
              height: '100%',
              color: theme.palette.primary.dark,
              border: `1px solid ${theme.palette.primary.dark}`,
              mr: 2,
            },
            startIcon: <AddIcon />,
          }}
        />
      </Box>
      <DataGridLayout
        containerStyle={{margin: 'unset'}}
        noRowsEmptySection={
          <EmptySection
            illustration="clipboard"
            size="tiny"
            containerStyle={{my: 'auto'}}
            btnAction={() => navigate('/units/new')}
            label="No units yet. They will appear here once added!"
            btnLabel="Create New Unit"
            showActionBtn
          />
        }
        rows={rows}
        columns={columns}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex}
        handlePageSizeChange={(newPageSize) =>
          setPage({...page, pageSize: newPageSize})
        }
        handlePageChange={(newPage) => setPage({...page, pageIndex: newPage})}
      />
    </TabContentContainer>
  );
};
