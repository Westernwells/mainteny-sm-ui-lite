import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GridRowsProp} from '@mui/x-data-grid';
import {PageListingLayout} from 'components/PageListingLayout';
import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {Progress} from 'components/Progress';
import {
  useCompanies,
  useUpdateServiceCompanySystemSettings,
} from 'hooks/reactQuery/useCompanies';
import {useQueryState} from 'hooks/useQueryState';
import {ServiceCompanyItem} from 'models/service-company';
import {createEmptyResource, makePage} from 'utils/paging';
import {Chip, ToggleButton, ToggleButtonGroup} from '@mui/material';
import {CompanyStatus} from 'models/company';
import {FilterFields} from 'components/FilterFields';
import {Widget} from '../../components/Widget';
import {getColumns, makeRows} from './CompaniesDataGridProps';

const pageSize = 13;

export const Companies = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useQueryState('searchCompanies');
  const totalCompaniesRef = useRef(0);

  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const textInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useQueryState<string>('status', {
    defaultValue: '',
  });
  const {mutateAsync: updateServiceCompanySystemSettings} =
    useUpdateServiceCompanySystemSettings('Updated Successfully');
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    setPage({
      ...page,
      pageIndex: 0,
    });
    setStatus(newAlignment);
  };

  const {
    data: companiesResource = createEmptyResource<ServiceCompanyItem>(pageSize),
    isLoading,
    isFetching,
    isFetched,
    isIdle,
  } = useCompanies(page, search, {keepPreviousData: true}, status);
  totalCompaniesRef.current =
    totalCompaniesRef.current || companiesResource.total;
  const handleStatusChange = useCallback(
    (id: string, serviceStatus: CompanyStatus) => {
      const resource = companiesResource.data.find((el) => el.id === id);
      if (resource) {
        const data = {
          nightlyShuffleEnabled: resource.settings.nightlyShuffleEnabled,
          companyDispatchStrategy: resource.settings.companyDispatchStrategy,
          serviceCompanyStatus: serviceStatus,
          expiryDate: resource.settings.expiryDate,
          userLimits: resource.settings.userLimits,
        };
        updateServiceCompanySystemSettings({
          companyId: resource.id,
          body: data,
        });
      }
    },
    [companiesResource],
  );

  const columns = useMemo(
    () =>
      getColumns({
        onActivate: handleStatusChange,
        onLiveSwitch: handleStatusChange,
        onDeactivate: handleStatusChange,
        onInternalSwitch: handleStatusChange,
      }),
    [handleStatusChange],
  );

  useEffect(() => {
    if (companiesResource.total > 0 && companiesResource.data.length === 0) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
  }, [search, status]);

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = search;
    }
  }, []);

  useEffect(() => {
    if (textInput.current) {
      textInput.current.value = search ?? '';
    }
  }, [search]);

  useEffect(() => {
    if (!isLoading && !isFetching && !isIdle) {
      setRows(makeRows(companiesResource.data));
    }
  }, [companiesResource, isLoading, isFetching, isIdle]);

  useEffect(() => {
    setPageCount(Math.ceil(companiesResource.total / page.pageSize));
  }, [companiesResource, page.pageSize]);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (isFetched && !totalCompaniesRef.current) {
    return (
      <EmptySection
        label="No companies have been created yet. Please click the button below to create one!"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  const renderFilterItems = () => (
    <FilterFields hideClear>
      <ToggleButtonGroup
        sx={{
          '&.MuiToggleButtonGroup-root': {
            backgroundColor: '#F7F9FC',
            borderRadius: '4px',
            padding: '5px',
            height: '40px',
          },
          '& .MuiButtonBase-root': {
            '&.MuiToggleButton-root': {
              fontSize: '12px',
              fontWeight: '400',
              padding: '4px 12px',
              textTransform: 'capitalize',
              '&.MuiToggleButton-root.Mui-selected': {
                backgroundColor: 'white',
              },
            },
          },
        }}
        value={status}
        exclusive
        onChange={handleChange}
        aria-label="Status">
        <ToggleButton value="">
          All{' '}
          <Chip
            label={totalCompaniesRef.current}
            variant="outlined"
            size="small"
            sx={{
              marginLeft: '8px',
              fontSize: '12px',
              padding: '2px',
              '& .MuiChip-label': {
                color: !status ? 'inherit' : 'rgb(143, 155, 179)',
              },
            }}
          />
        </ToggleButton>
        <ToggleButton value="ACTIVE">Live</ToggleButton>
        <ToggleButton value="TRIAL">Test</ToggleButton>
        <ToggleButton value="INTERNAL">Internal</ToggleButton>
        <ToggleButton value="DEACTIVATED">Inactive</ToggleButton>
      </ToggleButtonGroup>
    </FilterFields>
  );
  return (
    <PageListingLayout
      containerStyle={{
        backgroundColor: 'white',
        padding: '24px',
      }}
      renderWidget={
        <Widget
          searchPlaceholder="Search"
          getSearchValue={(val: string) => setSearch(val)}
          btnOnClick={() => navigate('/admin/companies/new')}
          showActionBtn
          btnLabel="New Company"
          refInput={textInput}
          filterItems={renderFilterItems()}
          containerStyles={{
            marginbottom: '32px',
            height: '50px',
          }}
          searchInputStyles={{
            backgroundColor: '#F7F9FC',
            borderRadius: '4px',
            height: '38px',
            color: 'action.active',
          }}
          buttonLabelStyles={{
            fontSize: '14px',
          }}
          buttonStyles={{
            textTransform: 'capitalize',
            fontSize: '14px',
            padding: '8px 16px ',
            height: '36px',
          }}
        />
      }>
      <DataGridLayout
        isEvenRowDifferentColor
        rows={rows || []}
        columns={columns}
        scrollToTop={search}
        loading={isFetching}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setPage({
            ...page,
            pageSize: newPageSize,
          })
        }
        handlePageChange={(newPage: number) =>
          setPage({
            ...page,
            pageIndex: newPage - 1,
          })
        }
        pageCount={pageCount}
        totalRows={companiesResource.total}
      />
    </PageListingLayout>
  );
};

export default Companies;
