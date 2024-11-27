import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
} from '@mui/material';
import {BottomDrawer} from 'components/BottomDrawer';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {SectionTitle} from 'pages/InvoiceDetails/SectionTitle';
import React, {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {ReactComponent as PinIllustration} from 'assets/illustrations/invoice/pin.svg';
import {Controller, useFieldArray, useForm} from 'react-hook-form';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {createEmptyResource, makePage} from 'utils/paging';
import {useQueryArticleSuppliers} from 'hooks/reactQuery/useArticle';
import {ArticleSupplierView} from 'models/supplier';
import {ComboBox} from 'components/ComboBox';
import {DatePicker} from 'components/DatePicker';
import {
  Currencies,
  getCurrencySymbol,
  useCurrentCurrency,
} from 'utils/currency';
import {DiscountType} from 'models/invoice';
import {
  NumericFormat as BaseNumericFormat,
  NumericFormatProps,
} from 'react-number-format';
import {LanguageContext} from 'context/LanguageProvider';
import {
  CreatePurchaseInvoiceRecord,
  PurchaseInvoiceStatus,
  PurchaseInvoiceStatusView,
  PurchaseInvoiceView,
  UpdatePurchaseInvoiceRecord,
} from 'models/purchaseInvoice';
import {
  useServiceOrders,
  useServiceOrderDetails,
} from 'hooks/reactQuery/useServiceOrder';
import {useQueryState} from 'hooks/useQueryState';
import {ServiceOrderOrderField, ServiceOrderView} from 'models/service-order';
import {endOfDay, startOfDay, subDays} from 'date-fns';
import {Order} from 'models/pagination';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  FileWithPreview,
  MappedFile,
  MyDropZone,
} from 'components/MyDropZone/MyDropzone';
import {
  useCreatePurchaseInvoice,
  useDeletePurchaseInvoice,
  useUpdatePurchaseInvoice,
} from 'hooks/reactQuery/usePurchaseInvoice';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {useNavigate, useLocation} from 'react-router-dom';
import {ServiceOrderComboBox} from 'components/ServiceOrderComboBox';
import CurrencySelect from 'components/CurrencySelect';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {PDFContainer} from 'components/PDFContainer';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import {Confirm} from 'components/Confirm';
import ChangePurchaseInvoiceStatusDialog from 'pages/PurchaseInvoices/ChangePurchaseInvoiceStatusDialog';
import CustomSnackbar from 'components/CustomSnackbar';
import {useSnackbar} from 'hooks/useSnackbar';
import {PurchaseInvoiceInfo} from 'pages/PurchaseInvoiceDetails/PurchaseInvoiceInfo';
import {getCurrencyData} from 'components/CurrencyIcons';
import queryString from 'query-string';

const NumericFormat = forwardRef<
  HTMLElement,
  NumericFormatProps<TextFieldProps>
>((props, ref) => <BaseNumericFormat {...props} getInputRef={ref} />);

const pageSize = 50;

type FormValues = {
  serviceCompanyId: string;
  externalId: string;
  subject: string;
  description: string;
  supplierId: string;
  supplierName: string;
  supplierExternalId: string;
  dueDate: string;
  sentDate: string;
  currency: string;
  serviceOrders: {
    serviceOrderId: string;
    netAmount?: number;
  }[];
  vatAmounts: {vat: number; percentageVat: number}[];
  discount: {
    type: DiscountType;
    amount: {
      value?: number;
      currency: string;
      fractionDigits?: number;
    };
    percentage?: number;
  };
  netAmount?: number;
  status: PurchaseInvoiceStatus;
  documents: FileWithPreview[];
};

type Props = {
  purchaseInvoice?: PurchaseInvoiceView;
  formType?: 'new' | 'edit';
  handleFilesUpload?: (files: FileWithPreview[]) => void;
  initialDocuments?: FileWithPreview[];
};

type SupplierOption = {
  label: string;
  value: string;
  externalId: string;
};

const NewPurchaseInvoice = ({
  purchaseInvoice,
  formType,
  handleFilesUpload,
  initialDocuments,
}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const navigate = useNavigate();
  const {search} = useLocation();
  const currentCurrency = useCurrentCurrency();
  const {enqueueSnackbar} = useSnackbar();
  const {data: uuid} = useUuid();
  const isDrawerOpen = true;
  const [modelQuery, setModelQuery] = useState('');
  const [dueDateError, setDueDateError] = useState('');
  const [resetDueDatePicker, setResetDueDatePicker] = useState(false);
  const [sentDateTouched, setSentDateTouched] = useState(false);
  const [dueDateTouched, setDueDateTouched] = useState(false);
  const [openPaymentStatusChange, setOpenPaymentStatusChange] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const {orderId} = queryString.parse(search);

  const {data: serviceOrderDetail, isLoading: isLoadingServiceOrder} =
    useServiceOrderDetails(orderId as string);

  const {mutateAsync: deletePurchaseInvoice, isLoading: isDeleting} =
    useDeletePurchaseInvoice();

  const documents =
    purchaseInvoice?.additionalInfo?.documents.map((doc) => ({
      ...doc,
      uri: doc.uri,
      description: doc.description || '',
    })) || [];

  const documentUris = documents.map((doc) => doc.uri);

  const {data: downloadUrls} = useDownloadUrl(documentUris);

  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, 25),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const {
    mutateAsync: createPurchaseInvoice,
    isLoading: isCreatingPurchaseInvoice,
  } = useCreatePurchaseInvoice();
  const {mutateAsync: updatePurchaseInvoiceAsync, isLoading: isUpdating} =
    useUpdatePurchaseInvoice();
  const {mutateAsync: uploadFiles, isLoading: isUploading} = useUploadFiles(
    'Documents uploaded successfully',
  );

  const {language: selectedLng} = useContext(LanguageContext);

  const currentDate = new Date();

  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  const {control, handleSubmit, watch, getValues, setValue} =
    useForm<FormValues>({
      mode: 'onChange',
      defaultValues: {
        serviceCompanyId: serviceCompanyId || '',
        externalId: purchaseInvoice?.externalId || '',
        subject: purchaseInvoice?.subject || '',
        description: purchaseInvoice?.description || '',
        supplierId: purchaseInvoice?.additionalInfo.supplier.id || '',
        supplierName: purchaseInvoice?.additionalInfo.supplier.name || '',
        supplierExternalId:
          purchaseInvoice?.additionalInfo.supplier.externalId || '',
        dueDate: purchaseInvoice?.dueDate || '',
        sentDate: purchaseInvoice?.sentDate || '',
        currency: purchaseInvoice?.totalAmount.currency || '',
        serviceOrders: purchaseInvoice?.additionalInfo.serviceOrders.map(
          (serviceOrder) => ({
            ...serviceOrder,
            netAmount:
              (serviceOrder.netAmount ?? 0) /
              10 ** Currencies[purchaseInvoice.totalAmount.currency],
          }),
        ) || [{serviceOrderId: '', netAmount: 0}],
        vatAmounts: purchaseInvoice?.totalAmount.vats || [
          {vat: 0, percentageVat: 0},
        ],
        discount: purchaseInvoice?.additionalInfo.discount || {
          type: DiscountType.PERCENTAGE,
          amount: {
            currency: currentCurrency?.code,
            fractionDigits: 2,
            value: 0,
          },
        },
        netAmount:
          (purchaseInvoice?.totalAmount.netAmount ?? 0) /
          10 ** (purchaseInvoice?.totalAmount.fractionDigits ?? 0),
        status: purchaseInvoice?.status || PurchaseInvoiceStatus.NEW,
        documents: [],
      },
    });

  const {
    fields: serviceOrders,
    append: appendServiceOrder,
    remove: removeServiceOrder,
  } = useFieldArray({
    control,
    name: 'serviceOrders',
  });

  useEffect(() => {
    if (serviceOrderDetail) {
      appendServiceOrder({
        serviceOrderId: serviceOrderDetail.id,
        netAmount: 0,
      });

      setValue('serviceOrders', [
        {
          serviceOrderId: serviceOrderDetail.id,
          netAmount: 0,
        },
      ]);
    }
  }, [serviceOrderDetail]);

  const {
    fields: vatAmounts,
    append: appendVatAmount,
    remove: removeVatAmount,
  } = useFieldArray({
    control,
    name: 'vatAmounts',
  });

  const handleFilesUpdate = (files: FileWithPreview[]) => {
    setValue('documents', files);
    handleFilesUpload?.(files);
  };

  const discountAmount = watch('discount.amount.value') || 0;
  const discountPercentage = watch('discount.percentage') || 0;
  const watchedDiscountType = watch('discount.type');
  const watchedNetAmount = Number(watch('netAmount'));
  const watchedCurrency = Number(watch('currency'));

  const [discountType, setDiscountType] = useState(
    watchedDiscountType || DiscountType.PERCENTAGE,
  );

  const [inputValue, setInputValue] = useState(
    discountType === DiscountType.AMOUNT ? discountAmount : discountPercentage,
  );

  const onSubmit = async (formData: FormValues) => {
    const purchaseInvoiceId = uuid;

    const uploadPath = `${serviceCompanyId}/purchaseInvoices/${purchaseInvoiceId}/documents`;

    const formattedDiscount = {
      type: discountType,
      amount: {
        currency: formData.currency || currentCurrency.code,
        value:
          discountType === DiscountType.AMOUNT
            ? inputValue * 10 ** Currencies[formData.currency]
            : 0,
        fractionDigits: 2,
      },
      percentage: discountType === DiscountType.PERCENTAGE ? inputValue : 0,
    };

    if (formType === 'edit' || !formType) {
      const updatePurchaseInvoice: UpdatePurchaseInvoiceRecord = {
        externalId: formData.externalId,
        subject: formData.subject,
        description: formData.description,
        supplier: {
          id: formData.supplierId,
          name: formData.supplierName,
          externalId: formData.supplierExternalId,
        },
        dueDate: formData.dueDate,
        sentDate: formData.sentDate,
        currency: formData.currency,
        serviceOrders: formData.serviceOrders.map((order) => ({
          ...order,
          netAmount:
            (order.netAmount ?? 0) * 10 ** Currencies[formData.currency],
        })),
        netAmount:
          (formData?.netAmount ?? 0) * 10 ** Currencies[formData.currency],
        vats: formData.vatAmounts.map((item) => ({
          vat: item.vat * 10 ** Currencies[formData.currency],
          percentageVat: Number(item.percentageVat),
        })),
        discount: formattedDiscount,
        status: formData.status,
        ...(initialDocuments?.length &&
          !purchaseInvoice?.additionalInfo.documents.length && {
            documents: formData.documents.reduce<FileWithPreview[]>(
              (newArr: any[], obj) => [
                ...newArr,
                {
                  type: obj.type,
                  uri: `${uploadPath}/${obj.name}`,
                  description: obj.name.split('.')[0],
                },
              ],
              [],
            ),
          }),
      };

      if (formData.documents.length || initialDocuments?.length) {
        await uploadFiles({files: formData.documents, uploadPath});
      }

      await updatePurchaseInvoiceAsync({
        data: {...updatePurchaseInvoice},
        invoiceId: purchaseInvoice?.id!,
      });

      navigate(`/purchase-invoices/details/${purchaseInvoice?.id}`);
    } else {
      const newPurchaseInvoice: CreatePurchaseInvoiceRecord = {
        serviceCompanyId: formData.serviceCompanyId,
        externalId: formData.externalId,
        subject: formData.subject,
        description: formData.description,
        supplier: {
          id: formData.supplierId,
          name: formData.supplierName,
          externalId: formData.supplierExternalId,
        },
        dueDate: formData.dueDate,
        sentDate: formData.sentDate,
        currency: formData.currency,
        serviceOrders: formData.serviceOrders.map((order) => ({
          ...order,
          netAmount:
            (order.netAmount ?? 0) * 10 ** Currencies[formData.currency],
        })),
        netAmount:
          (formData?.netAmount ?? 0) * 10 ** Currencies[formData.currency],
        vatAmounts: formData.vatAmounts.map((item) => ({
          vat: item.vat * 10 ** Currencies[formData.currency],
          percentageVat: Number(item.percentageVat),
        })),
        discount: formattedDiscount,
        status: formData.status,
        documents: formData.documents.reduce<MappedFile[]>(
          (newArr: MappedFile[], obj) => [
            ...newArr,
            {
              ...obj,
              type: obj.type,
              uri: `${uploadPath}/${obj.name}`,
              description: obj.name.split('.')[0],
            },
          ],
          [],
        ),
      };

      const response = await createPurchaseInvoice({
        data: {...newPurchaseInvoice},
      });

      if (formData.documents.length) {
        await uploadFiles({files: formData.documents, uploadPath});
      }

      navigate(`/purchase-invoices/details/${response.value}`);
    }
  };

  const {
    data: serviceOrdersResource = createEmptyResource<ServiceOrderView>(10),
  } = useServiceOrders(
    {
      end: endOfDay(currentDate).toISOString(),
      start: startOfDay(subDays(currentDate, 30)).toISOString(),
      pageIndex: page.pageIndex,
      pageSize: 50,
      query: searchQuery || ' ',
      orderBy: ServiceOrderOrderField.CREATED_TIME,
      order: Order.DESC,
      serviceCompanyId: user?.userAccount.serviceCompany.id,
    },
    {keepPreviousData: true},
  );

  useEffect(() => {
    if (
      serviceOrdersResource.total > 0 &&
      serviceOrdersResource.data.length === 0
    ) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
  }, [searchQuery, serviceOrdersResource]);

  const handleSupplierChange = (selectedSupplier: {
    id: string;
    name: string;
    externalId: string;
  }) => {
    setValue('supplierId', selectedSupplier.id);
    setValue('supplierName', selectedSupplier.name);
    setValue('supplierExternalId', selectedSupplier.externalId);
  };

  const {
    data: articleSupplierResource = createEmptyResource<ArticleSupplierView>(
      pageSize,
    ),
  } = useQueryArticleSuppliers(
    {...makePage(0, pageSize), query: modelQuery},
    {
      keepPreviousData: true,
    },
  );

  const isValid = () => {
    const isSupplierValid = !!(
      watch('supplierExternalId') &&
      watch('supplierName') &&
      watch('supplierId')
    );

    const hasValidServiceOrder = watch('serviceOrders').some(
      (serviceOrder) =>
        typeof serviceOrder?.serviceOrderId === 'string' &&
        serviceOrder.serviceOrderId.trim() !== '',
    );

    const hasValidDates = !!(watch('sentDate') && watch('dueDate'));
    const hasExternalId = !!watch('externalId');
    const hasSubject = !!watch('subject');
    const hasDescription = !!watch('description');
    const hasStatus = !!watch('status');
    const hasCurrency = !!watch('currency');

    return (
      !formType ||
      (isSupplierValid &&
        hasValidServiceOrder &&
        hasValidDates &&
        hasExternalId &&
        hasSubject &&
        hasDescription &&
        hasStatus &&
        hasCurrency)
    );
  };

  const handleOpenDeleteConfirm = () => {
    setOpenPaymentStatusChange(true);
  };

  const handleClose = () => {
    setOpenPaymentStatusChange(false);
  };

  const handleDeleteInvoice = () => {
    if (purchaseInvoice?.id)
      deletePurchaseInvoice(
        {invoiceId: purchaseInvoice?.id, shouldNavigate: false},
        {
          onSuccess: () => {
            enqueueSnackbar(
              <CustomSnackbar message="Invoice deleted" snackIcon="delete" />,
              {
                variant: 'info',
                anchorOrigin: {horizontal: 'right', vertical: 'bottom'},
              },
            );
          },
        },
      );
  };

  const actions = useMemo(() => {
    const items = [];

    items.push({
      label: t('Change Payment Status'),
      icon: <CompareArrowsOutlinedIcon />,
      onClick: handleOpenDeleteConfirm,
    });

    items.push({
      label: t('Delete'),
      icon: <DeleteIcon />,
      onClick: () => setOpenDeleteConfirm(true),
    });

    return items;
  }, []);

  useEffect(() => {
    if (!Number.isNaN(watchedNetAmount)) {
      const updatedVatAmounts = getValues('vatAmounts').map((vatAmount) => {
        const vatPercentage = vatAmount.percentageVat || 0;
        const updatedVat = (watchedNetAmount * vatPercentage) / 100;
        return {
          ...vatAmount,
          vat: parseFloat(updatedVat.toFixed(2)),
        };
      });
      setValue('vatAmounts', updatedVatAmounts, {shouldDirty: true});
    }
  }, [watchedNetAmount, getValues, setValue]);

  useEffect(() => {
    if (formType === 'edit' && purchaseInvoice) {
      const {supplier} = purchaseInvoice.additionalInfo;
      setValue('supplierId', supplier.id || '');
      setValue('supplierName', supplier.name);
      setValue('supplierExternalId', supplier.externalId);
    }
  }, [formType, purchaseInvoice]);

  useEffect(() => {
    if (initialDocuments && initialDocuments.length > 0 && purchaseInvoice) {
      const {supplier} = purchaseInvoice.additionalInfo;
      setValue('supplierId', supplier.id || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('supplierName', supplier.name || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('supplierExternalId', supplier.externalId || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [initialDocuments, purchaseInvoice, setValue]);

  useEffect(() => {
    const initialDiscountType = watchedDiscountType || DiscountType.PERCENTAGE;
    const initialValue =
      initialDiscountType === DiscountType.AMOUNT
        ? discountAmount || 0
        : discountPercentage || 0;
    setDiscountType(initialDiscountType);
    setInputValue(initialValue);
  }, [purchaseInvoice, watch]);

  const handleToggle = () => {
    const newType =
      discountType === DiscountType.AMOUNT
        ? DiscountType.PERCENTAGE
        : DiscountType.AMOUNT;

    setDiscountType(newType);
    setValue('discount.type', newType);

    if (newType === DiscountType.AMOUNT) {
      const calculatedAmount =
        (discountPercentage / 100) * (watchedNetAmount || 0);
      setValue('discount.amount.value', calculatedAmount);
      setInputValue(calculatedAmount);
    } else {
      const calculatedPercentage =
        (discountAmount / (watchedNetAmount || 1)) * 100;
      setValue('discount.percentage', calculatedPercentage);
      setInputValue(calculatedPercentage);
    }
  };

  return (
    <Grid
      container
      columnGap={3}
      justifyContent="space-between"
      alignItems="flex-start"
      wrap="nowrap"
      mb={12}>
      {documents.length ? (
        <Grid item xs={8} rowGap={2} borderRadius={1}>
          <Box>
            {documents.map((document, index) => (
              <Box key={`${document.uri}-${index}`} mb={4}>
                <Box>
                  <PDFContainer
                    url={downloadUrls ? downloadUrls[document.uri] : ''}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      ) : (
        <Grid
          container
          item
          xs={8}
          xl={8}
          rowGap={2}
          borderRadius={1}
          sx={{
            background: '#00D1FF0A',
            display: 'flex',
            alignItems: 'center',
            height: '100vh',
            justifyContent: 'center',
          }}>
          <Box>
            <MyDropZone
              getAcceptedFiles={handleFilesUpdate}
              hint={t('PDF, PNG or JPG (max. 5MB)')}
              acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
              maxFiles={5}
              bgColor="#ebf4f9"
            />
          </Box>
        </Grid>
      )}

      {formType === 'edit' ||
      formType === 'new' ||
      (initialDocuments?.length && !formType && !documents.length) ? (
        <Grid
          container
          item
          xs={4}
          xl={4}
          rowGap={4}
          bgcolor="white"
          p={3}
          borderRadius={1}>
          <Grid container item xs={12} rowGap={2.5}>
            <Box pb={0.5}>
              <SectionTitle
                Icon={PinIllustration}
                title="General Information"
              />
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box
                  gap={2.5}
                  sx={{display: 'flex', flexDirection: 'row', py: 2}}>
                  <Controller
                    name="supplierName"
                    control={control}
                    render={({field}) => (
                      <ComboBox
                        {...field}
                        containerStyles={{width: '100%'}}
                        options={
                          articleSupplierResource.data.map((item) => ({
                            label: item.name,
                            value: item.id,
                            externalId: item.externalId,
                          })) as SupplierOption[]
                        }
                        getValue={(item) => {
                          if (item) {
                            setModelQuery(item.value);
                            handleSupplierChange({
                              id: item.value,
                              name: item.label,
                              externalId: (item as SupplierOption).externalId,
                            });
                          } else {
                            setValue('supplierId', '');
                            setValue('supplierName', '');
                            setValue('supplierExternalId', '');
                          }
                        }}
                        getQuery={(item) => setModelQuery(item || '')}
                        initialValue={
                          purchaseInvoice?.additionalInfo.supplier
                            ? {
                                label:
                                  purchaseInvoice?.additionalInfo.supplier.name,
                                value:
                                  purchaseInvoice?.additionalInfo.supplier.id ||
                                  '',
                              }
                            : null
                        }
                        textFieldProps={{
                          label: t('Supplier'),
                          placeholder: t('Select a supplier'),
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="supplierExternalId"
                    control={control}
                    render={({field, fieldState: {error}}) => (
                      <FormInput
                        {...field}
                        fullWidth
                        fieldProps={{
                          label: t('Supplier ID'),
                          placeholder: t('Enter Supplier ID'),
                          id: 'supplierExternalId',
                          variant: 'outlined',
                          value: field.value,
                          onChange: field.onChange,
                          error: !!error,
                          helperText: error ? error.message : null,
                        }}
                      />
                    )}
                  />
                </Box>

                <Grid container spacing={2} alignItems="center">
                  {serviceOrders.map((serviceOrder, index) => (
                    <React.Fragment key={`${serviceOrder?.id}-${index}`}>
                      <Grid item xs={6}>
                        <Controller
                          name={`serviceOrders.${index}.serviceOrderId`}
                          control={control}
                          render={({field}) => (
                            <ServiceOrderComboBox
                              key={`service-order-combo-box-${index}`}
                              {...field}
                              containerStyles={{width: '100%'}}
                              options={serviceOrdersResource.data.map(
                                (order) => ({
                                  id: order.id,
                                  externalId: order.externalId,
                                  address:
                                    order.elevator.address.fullName || '-',
                                  company:
                                    order.elevator.propertyOwner.name || '-',
                                  type: order.type,
                                }),
                              )}
                              getValue={(selectedItem) => {
                                if (selectedItem) {
                                  setValue(
                                    `serviceOrders.${index}.serviceOrderId`,
                                    selectedItem.id,
                                  );
                                } else {
                                  setValue(
                                    `serviceOrders.${index}.serviceOrderId`,
                                    '',
                                  );
                                }
                              }}
                              getQuery={(item) => setSearchQuery(item || '')}
                              initialValue={
                                purchaseInvoice?.additionalInfo
                                  ?.serviceOrders?.[index]
                                  ? {
                                      id: purchaseInvoice?.additionalInfo
                                        .serviceOrders[index].serviceOrder.id,
                                      externalId:
                                        purchaseInvoice?.additionalInfo
                                          .serviceOrders[index].serviceOrder
                                          .externalId,
                                      address:
                                        serviceOrdersResource.data.find(
                                          (order) =>
                                            order.id ===
                                            purchaseInvoice?.additionalInfo
                                              .serviceOrders[index].serviceOrder
                                              .id,
                                        )?.elevator?.address?.fullName || '-',
                                      company:
                                        serviceOrdersResource.data.find(
                                          (order) =>
                                            order.id ===
                                            purchaseInvoice?.additionalInfo
                                              .serviceOrders[index].serviceOrder
                                              .id,
                                        )?.serviceCompany?.name || '-',
                                      type:
                                        serviceOrdersResource.data.find(
                                          (order) =>
                                            order.id ===
                                            purchaseInvoice?.additionalInfo
                                              .serviceOrders[index].serviceOrder
                                              .id,
                                        )?.type || '-',
                                    }
                                  : serviceOrderDetail &&
                                    serviceOrders.length < 2
                                  ? {
                                      id: serviceOrderDetail.id,
                                      externalId: serviceOrderDetail.externalId,
                                      address:
                                        serviceOrderDetail.elevator?.address
                                          ?.fullName || '-',
                                      company:
                                        serviceOrderDetail.elevator
                                          ?.propertyOwner?.name || '-',
                                      type: serviceOrderDetail.type,
                                    }
                                  : null
                              }
                              textFieldProps={{
                                label: 'Job Number',
                                placeholder: 'Select a job number',
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={serviceOrders.length > 1 ? 5 : 6}>
                        <Controller
                          name={`serviceOrders.${index}.netAmount`}
                          control={control}
                          render={({field: {onChange, value, ...field}}) => (
                            <NumericFormat
                              {...field}
                              value={value || 0}
                              customInput={TextField}
                              decimalScale={2}
                              decimalSeparator={
                                selectedLng === 'DE' || selectedLng === 'SR'
                                  ? ','
                                  : '.'
                              }
                              thousandSeparator={
                                selectedLng === 'DE' || selectedLng === 'SR'
                                  ? '.'
                                  : ','
                              }
                              size="small"
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    {getCurrencySymbol[watchedCurrency] ||
                                      currentCurrency.symbol}
                                  </InputAdornment>
                                ),
                                sx: {
                                  paddingRight: '8px',
                                  '& .MuiOutlinedInput-input': {
                                    padding: '8px 14px',
                                    textAlign: 'right',
                                    width: '100%',
                                  },
                                },
                              }}
                              label={t('Net Amount')}
                              fullWidth
                              onValueChange={(values: {
                                floatValue: number | undefined;
                              }) => {
                                const {floatValue} = values;
                                if (floatValue !== undefined) {
                                  onChange(floatValue);
                                  setValue(
                                    `serviceOrders.${index}.netAmount`,
                                    floatValue || 0,
                                  );
                                } else {
                                  onChange(0);
                                  setValue(
                                    `serviceOrders.${index}.netAmount`,
                                    0,
                                  );
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>
                      {serviceOrders.length > 1 && (
                        <Grid
                          item
                          xs={1}
                          sx={{
                            p: 1,
                            alignItems: 'center',
                            display: 'flex',
                            mt: 1.5,
                          }}>
                          <IconButton
                            onClick={() => removeServiceOrder(index)}
                            sx={{p: 0, m: 0}}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      )}
                    </React.Fragment>
                  ))}

                  <Grid item xs={12}>
                    <Button
                      onClick={() =>
                        appendServiceOrder({
                          serviceOrderId: '',
                          netAmount: 0,
                        })
                      }
                      variant="text"
                      sx={{color: '#0092B2'}}
                      startIcon={<AddIcon />}>
                      {t('Add job number')}
                    </Button>
                  </Grid>
                </Grid>

                <Box
                  gap={2.5}
                  sx={{display: 'flex', flexDirection: 'row', py: 2}}>
                  <Controller
                    name="sentDate"
                    control={control}
                    render={({field}) => (
                      <DatePicker
                        defaultDate={
                          field.value ? new Date(field.value) : undefined
                        }
                        getSelectedDate={(newValue) => {
                          const formattedDate = newValue
                            ? newValue.toISOString().split('T')[0]
                            : '';
                          setValue('sentDate', formattedDate);
                        }}
                        textFieldProps={{
                          label: 'Invoice Date',
                          required: true,
                          value: field.value ? new Date(field.value) : '',
                          error: sentDateTouched && !field.value,
                          onBlur: () => setSentDateTouched(true),
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="dueDate"
                    control={control}
                    render={({field}) => (
                      <DatePicker
                        defaultDate={
                          field.value ? new Date(field.value) : undefined
                        }
                        reset={resetDueDatePicker}
                        getReset={(_reset) => {
                          if (_reset) {
                            setResetDueDatePicker(false);
                          }
                        }}
                        errorMessage={dueDateError}
                        getSelectedDate={(newValue) => {
                          setDueDateError('');
                          const formattedDate = newValue
                            ? newValue.toISOString().split('T')[0]
                            : '';
                          setValue('dueDate', formattedDate);
                        }}
                        textFieldProps={{
                          label: 'Due Date',
                          value: field.value ? new Date(field.value) : '',
                          required: true,
                          error:
                            dueDateTouched && (!field.value || !!dueDateError),
                          onBlur: () => setDueDateTouched(true),
                        }}
                      />
                    )}
                  />
                </Box>

                <Box
                  gap={2.5}
                  sx={{display: 'flex', flexDirection: 'row', py: 2}}>
                  <Controller
                    name="externalId"
                    control={control}
                    rules={{required: 'Invoice Number is required'}}
                    render={({field, fieldState: {error}}) => (
                      <FormInput
                        {...field}
                        containerStyles={{width: '100%'}}
                        fieldProps={{
                          id: 'externalId',
                          required: true,
                          label: 'Invoice Number',
                          variant: 'outlined',
                          value: field.value,
                          onChange: field.onChange,
                          error: !!error,
                          helperText: error ? error.message : null,
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{py: 1}}>
                  <Controller
                    name="subject"
                    control={control}
                    rules={{required: 'Subject is required'}}
                    render={({field, fieldState: {error}}) => (
                      <FormInput
                        {...field}
                        containerStyles={{width: '100%'}}
                        fieldProps={{
                          id: 'subject',
                          label: 'Subject',
                          required: true,
                          variant: 'outlined',
                          value: field.value,
                          onChange: field.onChange,
                          error: !!error,
                          helperText: error ? error.message : null,
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{py: 1}}>
                  <Controller
                    name="description"
                    control={control}
                    render={({field, fieldState: {error}}) => (
                      <FormInput
                        {...field}
                        containerStyles={{width: '100%'}}
                        fieldProps={{
                          id: 'description',
                          label: 'Description',
                          required: true,
                          variant: 'outlined',
                          value: field.value,
                          onChange: field.onChange,
                          error: !!error,
                          helperText: error ? error.message : null,
                          multiline: true,
                          rows: 4,
                        }}
                      />
                    )}
                  />
                </Box>

                <Box
                  gap={2.5}
                  sx={{display: 'flex', flexDirection: 'row', pt: 2, pb: 1}}>
                  <Grid item xs={6}>
                    <Controller
                      name="currency"
                      control={control}
                      render={({field, fieldState: {error}}) => (
                        <CurrencySelect
                          labelId="currency-label"
                          label="Currency"
                          options={Object.entries(getCurrencyData).map(
                            ([label, {symbol, FlagComponent}]) => ({
                              label,
                              value: label,
                              symbol,
                              FlagComponent,
                            }),
                          )}
                          value={field.value}
                          onChange={field.onChange}
                          error={!!error}
                          errorText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name="netAmount"
                      control={control}
                      render={({field: {onChange, value, ...field}}) => (
                        <NumericFormat
                          {...field}
                          value={value || 0}
                          customInput={TextField}
                          allowLeadingZeros={false}
                          decimalScale={2}
                          decimalSeparator={
                            selectedLng === 'DE' || selectedLng === 'SR'
                              ? ','
                              : '.'
                          }
                          thousandSeparator={
                            selectedLng === 'DE' || selectedLng === 'SR'
                              ? '.'
                              : ','
                          }
                          size="small"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment
                                position="end"
                                sx={{
                                  borderLeft: '1px solid #E4E9F2',
                                }}>
                                {getCurrencySymbol[watchedCurrency] ||
                                  currentCurrency.symbol}
                              </InputAdornment>
                            ),
                            sx: {
                              paddingRight: '8px',
                              '& .MuiOutlinedInput-input': {
                                padding: '8px 14px',
                                textAlign: 'right',
                                width: '100%',
                              },
                            },
                          }}
                          label={t('Net Amount')}
                          onValueChange={(values: {
                            floatValue: number | undefined;
                          }) => {
                            const {floatValue} = values;
                            if (floatValue !== undefined) {
                              onChange(floatValue);
                              setValue('netAmount', floatValue);
                            } else {
                              onChange(0);
                              setValue('netAmount', 0);
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Box>

                <Grid container spacing={2} alignItems="center" sx={{pt: 2}}>
                  {vatAmounts.map((vatAmount, index) => (
                    <React.Fragment key={vatAmount.id}>
                      <Grid item xs={6}>
                        <Controller
                          name={`vatAmounts.${index}.percentageVat`}
                          control={control}
                          render={({field: {onChange, value, ...field}}) => (
                            <NumericFormat
                              {...field}
                              value={value || 0}
                              customInput={TextField}
                              decimalScale={2}
                              decimalSeparator={
                                selectedLng === 'DE' || selectedLng === 'SR'
                                  ? ','
                                  : '.'
                              }
                              thousandSeparator={
                                selectedLng === 'DE' || selectedLng === 'SR'
                                  ? '.'
                                  : ','
                              }
                              size="small"
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment
                                    position="end"
                                    sx={{
                                      borderLeft: '1px solid #E4E9F2',
                                    }}>
                                    %
                                  </InputAdornment>
                                ),
                                sx: {
                                  paddingRight: '8px',
                                  '& .MuiOutlinedInput-input': {
                                    padding: '8px 14px',
                                    textAlign: 'right',
                                    width: '100%',
                                  },
                                },
                              }}
                              label={t('Tax Rate')}
                              isAllowed={(values: {
                                floatValue: number | undefined;
                              }) => {
                                const {floatValue} = values;
                                return !floatValue || floatValue <= 100;
                              }}
                              onValueChange={(values: {
                                floatValue: number | undefined;
                              }) => {
                                const {floatValue} = values;
                                if (floatValue !== undefined) {
                                  onChange(floatValue);
                                  setValue(
                                    `vatAmounts.${index}.percentageVat`,
                                    floatValue,
                                  );
                                  if (vatAmounts.length <= 1) {
                                    setValue(
                                      `vatAmounts.${index}.vat`,
                                      watchedNetAmount * (floatValue / 100),
                                    );
                                  }
                                } else {
                                  setValue(`vatAmounts.${index}.vat`, 0);
                                  setValue(
                                    `vatAmounts.${index}.percentageVat`,
                                    0,
                                  );
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={vatAmounts.length > 1 ? 5 : 6}>
                        <Controller
                          name={`vatAmounts.${index}.vat`}
                          control={control}
                          render={({field: {onChange, value, ...field}}) => (
                            <NumericFormat
                              {...field}
                              value={value || 0}
                              customInput={TextField}
                              decimalScale={2}
                              decimalSeparator={
                                selectedLng === 'DE' || selectedLng === 'SR'
                                  ? ','
                                  : '.'
                              }
                              thousandSeparator={
                                selectedLng === 'DE' || selectedLng === 'SR'
                                  ? '.'
                                  : ','
                              }
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    {getCurrencySymbol[watchedCurrency] ||
                                      currentCurrency.symbol}
                                  </InputAdornment>
                                ),

                                sx: {
                                  paddingRight: '8px',
                                  '& .MuiOutlinedInput-input': {
                                    padding: '8px 14px',
                                    textAlign: 'right',
                                    width: '100%',
                                  },
                                },
                              }}
                              label={t('Tax Amount')}
                              isAllowed={(values: {
                                floatValue: number | undefined;
                              }) => {
                                const {floatValue} = values;
                                return (
                                  !floatValue || floatValue <= watchedNetAmount
                                );
                              }}
                              onValueChange={(values: {
                                floatValue: number | undefined;
                              }) => {
                                const {floatValue} = values;
                                if (floatValue !== undefined) {
                                  const percentageVat =
                                    (floatValue / watchedNetAmount) * 100;

                                  onChange(floatValue);

                                  setValue(
                                    `vatAmounts.${index}.vat`,
                                    floatValue,
                                  );

                                  if (vatAmounts.length <= 1) {
                                    setValue(
                                      `vatAmounts.${index}.percentageVat`,
                                      percentageVat,
                                    );
                                  }
                                } else {
                                  setValue(`vatAmounts.${index}.vat`, 0);
                                  setValue(
                                    `vatAmounts.${index}.percentageVat`,
                                    0,
                                  );
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>

                      {vatAmounts.length > 1 && (
                        <Grid
                          item
                          xs={1}
                          sx={{
                            p: 1,
                            alignItems: 'center',
                            display: 'flex',
                            mt: 1.5,
                          }}>
                          <IconButton
                            onClick={() => removeVatAmount(index)}
                            sx={{p: 0, m: 0}}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      )}
                    </React.Fragment>
                  ))}

                  <Grid item xs={12}>
                    <Button
                      onClick={() =>
                        appendVatAmount({vat: 0, percentageVat: 0})
                      }
                      variant="text"
                      sx={{color: '#0092B2'}}
                      startIcon={<AddIcon />}>
                      {t('Add tax rate')}
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{width: '47%', py: 2}}>
                  <Controller
                    name="discount"
                    control={control}
                    render={({field: {onChange}}) => (
                      <NumericFormat
                        value={inputValue}
                        isAllowed={(values) => {
                          const {floatValue} = values;
                          if (floatValue === undefined) return true;

                          return discountType === DiscountType.PERCENTAGE
                            ? floatValue <= 100
                            : floatValue <= (watchedNetAmount ?? 0);
                        }}
                        customInput={TextField}
                        allowLeadingZeros={false}
                        decimalScale={2}
                        decimalSeparator="."
                        thousandSeparator=","
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleToggle} size="small">
                                {discountType === DiscountType.AMOUNT
                                  ? getCurrencySymbol[watchedCurrency] ||
                                    currentCurrency.symbol
                                  : '%'}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        label={t('Discount')}
                        onValueChange={(values) => {
                          const {floatValue} = values;
                          const newValue = floatValue ?? 0;
                          setInputValue(newValue);

                          if (discountType === DiscountType.AMOUNT) {
                            setValue('discount.amount.value', newValue);
                          } else {
                            setValue('discount.percentage', newValue);
                          }

                          onChange(newValue);
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{width: '47%', py: 2}}>
                  <Controller
                    name="status"
                    control={control}
                    render={({field, fieldState: {error}}) => (
                      <FormSelect
                        labelId="status-label"
                        label={t('Status')}
                        options={Object.entries(PurchaseInvoiceStatusView).map(
                          ([key, value]) => ({
                            label: value,
                            value: key,
                          }),
                        )}
                        selectProps={{
                          id: 'status',
                          value: field.value,
                          onChange: field.onChange,
                          error: !!error,
                          name: 'status',
                        }}
                        errorText={error?.message}
                        required
                      />
                    )}
                  />
                </Box>
              </form>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <PurchaseInvoiceInfo purchaseInvoice={purchaseInvoice} />
      )}

      <BottomDrawer
        isOpen={isDrawerOpen}
        isSaving={
          isUploading ||
          isCreatingPurchaseInvoice ||
          isUpdating ||
          isLoadingServiceOrder
        }
        primaryButtonLabel={
          formType === 'edit' ||
          formType === 'new' ||
          (initialDocuments?.length && !formType && !documents.length)
            ? t('Save')
            : t('Edit')
        }
        primaryButtonAction={
          formType === 'edit' ||
          formType === 'new' ||
          (initialDocuments?.length && !formType && !documents.length)
            ? handleSubmit(onSubmit)
            : () =>
                navigate(
                  `/purchase-invoices/details/${purchaseInvoice?.id}/edit`,
                )
        }
        listItems={actions.map((item) => ({
          ...item,
          showBorder: actions[actions.length - 1] !== item,
        }))}
        isValid={isValid()}
      />

      <ChangePurchaseInvoiceStatusDialog
        open={openPaymentStatusChange}
        id={purchaseInvoice?.id!}
        onClose={handleClose}
      />

      <Confirm
        maxWidth={400}
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={() => {
          handleDeleteInvoice();
          setOpenDeleteConfirm(false);
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Delete Invoice"
        content="You are about to delete this invoice. Are you sure about it?"
      />
    </Grid>
  );
};

export default NewPurchaseInvoice;
