import {Box, Typography} from '@mui/material';
import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {theme} from 'theme';
import {ReactComponent as WrenchScrewdriverIllustration} from 'assets/illustrations/invoice/wrench-screwdriver.svg';
import {
  NewServiceOrderItemRecord,
  ServiceOrderAmountDetail,
  ServiceOrderSubArticleRecord,
  ServiceOrderView,
  UpdateServiceOrderAmountRecord,
} from 'models/service-order';
import {
  useCalculateServiceOrderAmount,
  useServiceOrderArticles,
  useServiceOrderSubItems,
  useUpdateServiceOrderArticlesAmount,
} from 'hooks/reactQuery/useServiceOrder';
import {Progress} from 'components/Progress';
import {
  buildServiceOrderPayload,
  formatServiceOrderArticles,
  serviceOrderItemToServiceOrderItemRecord,
} from 'utils/service-order-utils';
import {useForm} from 'react-hook-form';
import {moneyToCents, useCurrentCurrency} from 'utils/currency';
import {debounce} from 'lodash';
import {ArticleType} from 'models/article';
import {Discount, DiscountType} from 'models/invoice';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import UpdateConfirmationModal from 'pages/ServiceOrderDetails/UpdateConfirmationModal';
import {Dialog} from 'components/Dialog';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import * as Sentry from '@sentry/react';
import ServiceOrderPositionTable from './ServiceOrderPositionTable';

type Props = {
  serviceOrder: ServiceOrderView;
};

type OpenMode = 'add' | 'edit' | null;

const ServiceOrderPositions = ({serviceOrder}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const {t} = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const [openMode, setOpenMode] = useState<OpenMode>(null);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const {
    data: serviceOrderArticles,
    isLoading: isLoadingServiceOrderArticles,
    refetch: refetchArticles,
  } = useServiceOrderArticles(serviceOrder?.id);

  const {
    data: serviceOrderSubItems,
    isLoading: isLoadingSubItems,
    refetch: refetchSubArticles,
  } = useServiceOrderSubItems(serviceOrder.id);

  const [serviceOrderAmountDetail, setServiceOrderAmountDetail] = useState<
    ServiceOrderAmountDetail | undefined
  >(undefined);

  const {
    mutateAsync: updateServiceOrderArticlesAmount,
    isLoading: isLoadingUpdate,
  } = useUpdateServiceOrderArticlesAmount();

  const {mutateAsync: calculateServiceOrderAmount} =
    useCalculateServiceOrderAmount();

  const subItemsMap = useMemo(
    () =>
      Object.entries(serviceOrderSubItems ?? {}).reduce(
        (acc, [parentId, subItems]) => {
          acc[parentId] = subItems.map((subItem) => ({
            ...subItem,
            parentId,
          }));
          return acc;
        },
        {} as Record<string, ServiceOrderSubArticleRecord[]>,
      ),
    [serviceOrderSubItems],
  );

  const initialValues = {
    items:
      serviceOrderArticles?.map((item) =>
        serviceOrderItemToServiceOrderItemRecord(item, subItemsMap),
      ) ?? [],
    discount: getDiscoutObj(serviceOrder?.additionalInfo?.discount),
  };

  const formMethods = useForm<{
    items: NewServiceOrderItemRecord[];
    discount?: Discount;
  }>({
    defaultValues: initialValues,
    mode: 'onChange',
  });

  const {watch, setValue, getValues, reset} = formMethods;
  const watchedItems = watch('items');
  const watchedDiscount = watch('discount');

  const isValid = () => {
    const currentValues = getValues();
    const currentItems = currentValues.items || [];

    const localHasEmptyItemName = currentItems.some(
      (item) => !item.name?.trim(),
    );
    const localHasMixItemWithoutSubItems = currentItems.some(
      (item) =>
        item.article?.type === ArticleType.MIX &&
        (!item.subItems || item.subItems.length === 0),
    );

    const valid =
      currentItems.length > 0 &&
      !localHasEmptyItemName &&
      !localHasMixItemWithoutSubItems;

    return !!valid;
  };

  const handleAddPositionClick = () => {
    setOpenMode('add');
    setIsOpen(true);
  };

  const handleOpenEditor = () => {
    setOpenMode('edit');
    reset(initialValues);
    setIsOpen(true);
  };

  const recalcServiceOrder = useCallback(
    debounce(async () => {
      const currentValues = getValues();
      const currentItems = currentValues.items;

      const hasEmptyItemName = currentItems?.some((item) => !item.name?.trim());
      const hasMixItemWithoutSubItems = currentItems?.some(
        (item) =>
          item.article?.type === ArticleType.MIX &&
          (!item.subItems || item.subItems.length === 0),
      );

      if (hasEmptyItemName || hasMixItemWithoutSubItems) {
        return;
      }

      try {
        const payload = buildServiceOrderPayload(
          currentItems || [],
          currentCurrency,
          currentValues.discount,
        );

        const detail = await calculateServiceOrderAmount({
          serviceOrderId: serviceOrder.id,
          data: payload,
        });
        setServiceOrderAmountDetail(detail);
      } catch (error) {
        Sentry.captureException(error);
      }
    }, 300),
    [calculateServiceOrderAmount, currentCurrency, getValues, setValue, isOpen],
  );

  const handleSaveArticle = async () => {
    const body: UpdateServiceOrderAmountRecord = {
      articles: formatServiceOrderArticles(watch('items'), currentCurrency),
      globalDiscount: watchedDiscount
        ? {
            type: watchedDiscount?.type!,
            percentage:
              watchedDiscount?.type === DiscountType.PERCENTAGE
                ? watchedDiscount?.percentage
                : undefined,
            amount:
              watchedDiscount?.type === DiscountType.AMOUNT
                ? {
                    ...watchedDiscount?.amount,
                    currency: watchedDiscount?.amount?.currency!,
                    value: moneyToCents(
                      currentCurrency.code,
                      watchedDiscount?.amount?.value ?? 0,
                    ),
                  }
                : undefined,
          }
        : undefined,
    };

    await updateServiceOrderArticlesAmount({
      serviceOrder: serviceOrder.id,
      data: body,
    });

    await refetchArticles();
    await refetchSubArticles();

    setIsOpen(false);
  };

  const handleConfirmClose = () => {
    setIsConfirmDialogOpen(false);
  };

  const handleConfirmAccept = () => {
    handleSaveArticle();
    handleConfirmClose();
  };

  useEffect(() => {
    if (!serviceOrderArticles) return;

    const newItems = serviceOrderArticles.map((item) =>
      serviceOrderItemToServiceOrderItemRecord(item, subItemsMap),
    );
    reset({
      items: newItems,
      discount: getDiscoutObj(serviceOrder?.additionalInfo?.discount),
    });
  }, [serviceOrder, serviceOrderArticles, subItemsMap, reset]);

  useEffect(() => {
    recalcServiceOrder();
  }, [recalcServiceOrder, watchedItems, watchedDiscount]);

  const renderNoRowsSection = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '2em 0em',
      }}>
      <EmptySection
        illustration="mixedPositions"
        size="tiny"
        containerStyle={{m: 'auto', width: '60%'}}
        showActionBtn
        btnLabel="Add Position"
        buttonVariant="outlined"
        label="No Position"
        labelVariant="h6"
        btnAction={handleAddPositionClick}
        subLabel="Start adding your positions and mixed positions"
        subLabelProps={{
          pt: 1.5,
          pb: 0.7,
          fontSize: '0.9rem',
          color: theme.palette.text.secondary,
        }}
      />
    </Box>
  );

  useEffect(() => {
    if (watchedItems.length === 0 && openMode) {
      handleAddPositionClick();
    }
  }, [watchedItems.length]);

  if (isLoadingSubItems || isLoadingServiceOrderArticles) return <Progress />;

  return (
    <InfoCard
      containerStyles={{
        [theme.breakpoints.up('md')]: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '& .MuiCardHeader-root': {
            marginBottom: 0.5,
          },
        },
      }}
      headerActionIcon={
        <EditOutlinedIcon sx={{color: theme.palette.text.disabled}} />
      }
      headerIcon={
        <WrenchScrewdriverIllustration
          style={{width: '2rem', height: '2rem'}}
        />
      }
      handleAction={handleOpenEditor}
      header={<Typography variant="h5">{t('Positions')}</Typography>}>
      {!watchedItems?.length ? (
        renderNoRowsSection()
      ) : (
        <ServiceOrderPositionTable
          disableInlineEditing
          serviceOrderAmountDetail={serviceOrderAmountDetail}
          formMethods={formMethods}
          onRecalcServiceOrder={recalcServiceOrder}
          onAddPosition={handleAddPositionClick}
          onEditDiscount={handleOpenEditor}
        />
      )}

      <Dialog
        title="Edit Mixed Position"
        onCancel={() => {
          setIsOpen(false);
          setOpenMode(null);
          reset();
        }}
        onSave={() => {
          setIsConfirmDialogOpen(true);
        }}
        disableSaveBtn={isLoadingUpdate || !isValid()}
        dialogProps={{
          maxWidth: 'xl',
          open: isOpen || false,
        }}
        saveButtonText="Save"
        saveButtonContainerStyles={{
          justifyContent: 'space-between',
          display: 'flex',
          width: '100%',
        }}
        cancelButtonVariant="outlined"
        cancelButtonStyles={{border: '1px solid #000034', color: ' #000034'}}
        cancelButtonTextColor="text.primary">
        <ServiceOrderPositionTable
          serviceOrderAmountDetail={serviceOrderAmountDetail}
          formMethods={formMethods}
          onRecalcServiceOrder={recalcServiceOrder}
          autoOpenAdd={openMode === 'add'}
          onAddPosition={handleAddPositionClick}
          onEditDiscount={handleOpenEditor}
        />
      </Dialog>

      {isConfirmDialogOpen && (
        <UpdateConfirmationModal
          open={isConfirmDialogOpen}
          order={serviceOrder}
          onConfirm={handleConfirmAccept}
          onCancel={handleConfirmClose}
        />
      )}
    </InfoCard>
  );
};

export default ServiceOrderPositions;
