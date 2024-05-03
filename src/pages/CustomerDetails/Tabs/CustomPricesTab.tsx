import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FormikHelpers} from 'formik';
import {GridRowsProp} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';
import {Progress} from 'components/Progress';
import {DataGridLayout} from 'components/DataGridLayout';
import {TravelWorkFormValues} from 'models/service-company';
import {
  useCreateTravelWork,
  usePropertyOwnerQueryTravelWorks,
} from 'hooks/reactQuery/useTravelWork';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {ServiceOrderType} from 'models/service-order';
import {CustomerPricesForm} from './CustomerPricesDataGrid/CustomerPricesForm';
import {
  columns,
  makeRows,
} from './CustomerPricesDataGrid/CustomerPricesDataGrid';

interface Props {
  propertyOwnerId: string;
}

export const CustomPricesTab = ({propertyOwnerId}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();

  const [openDialog, setOpenDialog] = useState(false);
  const [rows, setRows] = useState<GridRowsProp>([]);

  const {
    data: travelWorksResource = [],
    isLoading,
    isFetching,
    isFetched,
  } = usePropertyOwnerQueryTravelWorks(
    propertyOwnerId,
    {
      serviceOrderType: ServiceOrderType.GENERAL,
    },
    {keepPreviousData: true},
  );

  const {mutate: createTravelWork} = useCreateTravelWork(
    'Article created successfully',
  );

  useEffect(() => {
    if (isFetched) setRows(makeRows(travelWorksResource));
  }, [travelWorksResource]);

  const onClose = () => {
    setOpenDialog(false);
  };

  const onSubmit = async (
    values: TravelWorkFormValues,
    {resetForm}: FormikHelpers<TravelWorkFormValues>,
  ) => {
    await createTravelWork({
      propertyOwnerId,
      serviceCompanyId: user!.userAccount.serviceCompany.id,
      serviceOrderType: ServiceOrderType.GENERAL,
      articleSellingPrice: values.articleSellingPrice,
      calculationType: values.calculationType,
      articleId: values.articleId,
    });

    resetForm();
    onClose();
  };

  return (
    <>
      <InfoCard
        header={
          <Typography variant="subtitle1">
            {t('Customer specific article')}
          </Typography>
        }
        containerStyles={{flexGrow: 1}}
        bodyContainerStyle={{height: '100%'}}
        headerStyles={{mt: '0.5rem'}}
        handleAction={() => setOpenDialog(true)}
        headerActionIcon={
          isFetched && travelWorksResource.length ? (
            <Typography color="info.main">
              {`+ ${t('Add Article & Spare part')}`}
            </Typography>
          ) : undefined
        }
        showHeaderBackground>
        {isLoading ? (
          <Progress />
        ) : isFetched && !travelWorksResource.length ? (
          <EmptySection
            label="No specific prices added, start adding your service prices!"
            showActionBtn
            btnLabel="Add Article"
            btnAction={() => setOpenDialog(true)}
            illustration="clipboard"
            size="small"
            containerStyle={{height: '80%'}}
          />
        ) : (
          <DataGridLayout
            fullHeight={false}
            isCellClickable={false}
            height="100%"
            rows={rows || []}
            columns={columns}
            loading={isFetching}
          />
        )}
      </InfoCard>
      <CustomerPricesForm
        title="Add customer specific article"
        openDialog={openDialog}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </>
  );
};
