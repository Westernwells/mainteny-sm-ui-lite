import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useNavigate} from 'react-router-dom';
import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {GridRowsProp} from '@mui/x-data-grid';

import {DataGridLayout} from 'components/DataGridLayout';
import {InfoCard} from 'components/InfoCard';
import {useQueryCustomerElevator} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {padNumber} from 'utils/utils';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {EmptySection} from 'components/EmptySection';
import {SearchInput} from 'components/SearchInput';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {columns, makeRows} from './UnitsWidgetDataGridProps';

interface Props {
  customerId?: string;
  getTotalUnits?: (val: number) => void;
  openTab: () => void;
}

export const UnitsWidget = ({customerId, getTotalUnits, openTab}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [page, setPage] = useState(makePage(0, 500));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [unitQuery, setUnitQuery] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const totalUnitsRef = useRef(0);

  const {
    data: elevatorResource = createEmptyResource<ElevatorView>(500),
    isFetching,
    isFetched,
  } = useQueryCustomerElevator(
    {
      query: unitQuery,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
    },
    {},
    customerId,
  );

  useEffect(() => {
    setRows(makeRows(elevatorResource));
    setPageCount(Math.ceil(elevatorResource.total / page.pageSize));
    if (getTotalUnits) {
      getTotalUnits(elevatorResource.total);
    }
  }, [elevatorResource]);

  const addNewUnit = () => {
    navigate('/units/new');
  };

  totalUnitsRef.current = totalUnitsRef.current || elevatorResource.total;

  return (
    <InfoCard
      header={
        <Box display="flex">
          <Typography variant="subtitle1">{t('Units')}</Typography>
          {rows.length > 0 && (
            <Box
              sx={{
                fontSize: '0.750em',
                lineHeight: '1.250em',
                letterSpacing: '0.4px',
                color: 'white',
                background: '#457892',
                borderRadius: '4px',
                marginLeft: '0.625em',
                display: 'flex',
                alignItems: 'center',
                padding: '0 0.625em',
              }}>
              {padNumber(elevatorResource.total || 0)}
            </Box>
          )}
        </Box>
      }
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}
      handleAction={() => {
        Mixpanel.identifyAndTrack(mixpanelEvents.CUSTOMERS_OVERVIEW_OPEN, {
          pageName: 'Customers',
          source: 'Units',
        });
        openTab();
      }}
      headerActionIcon={<OpenInNew />}
      showHeaderBackground>
      {isFetched && !totalUnitsRef.current && (
        <EmptySection
          illustration="clipboard"
          size="tiny"
          containerStyle={{m: 'auto', width: '60%', minHeight: '24.375em'}}
          label="No units yet. Please click the button below to add!"
          showActionBtn
          btnLabel="Add New Unit"
          btnAction={addNewUnit}
        />
      )}
      {!!totalUnitsRef.current && (
        <>
          <SearchInput
            containerStyle={{
              height: '100%',
              border: '1px solid #E4E9F2',
              borderRadius: '4px',
              marginBottom: '0.938em',
              marginTop: '0.313em',
            }}
            placeholder="Search by unit, category"
            onValueChanged={(value: string) => setUnitQuery(value)}
          />
          <DataGridLayout
            fullHeight={false}
            height={320}
            rows={rows}
            scrollToTop={unitQuery}
            columns={columns}
            loading={isFetching}
            containerStyle={{
              borderBottom: 'none',
            }}
            isWidget
            pageIndex={page.pageIndex + 1}
            pageSize={page.pageSize}
            handlePageSizeChange={(newPageSize: number) =>
              setPage({...page, pageSize: newPageSize})
            }
            handlePageChange={(newPage: number) => {
              setPage({...page, pageIndex: newPage - 1});
            }}
            pageCount={pageCount}
            totalRows={elevatorResource.total}
          />
        </>
      )}
    </InfoCard>
  );
};
