import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Dialog} from 'components/Dialog';
import {
  Box,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Popover,
  RadioGroup,
  Select,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import InvoiceFrequencyPicker from 'components/InvoiceFrequencyPicker';
import JobFrequencyPicker from 'components/JobFrequencyPicker/JobFrequencyPicker';
import {ReactComponent as BasicInfoIcon} from 'assets/icons/BasicInfoIcon.svg';
import {ReactComponent as LiftIcon} from 'assets/icons/LiftIcon.svg';
import {DatePicker} from 'components/DatePicker';
import {FormInput} from 'components/form/FormInput';
import {
  calculateContractInvoicePriceTotal,
  ContractComponentElevator,
  ContractComponentView,
  ContractServiceForm,
  ContractServiceFormElevator,
  ContractTimeUnit,
  UpdateContractComponents,
} from 'models/contract';
import {componentsToMutate, isUnitSelected} from 'utils/contract';
import {theme} from 'theme';
import {Switch} from 'components/Switch';
import {FormikProps, getIn} from 'formik';
import {ArticleType} from 'models/article';
import {Button} from 'components/Button';
import {getArticleTypeText} from 'utils/article-utils';
import {FormRadio} from 'components/form/FormRadio';
import CloseIcon from '@mui/icons-material/Close';
import {useTranslation} from 'react-i18next';
import {ReactComponent as PackageIcon} from 'assets/icons/PackageIcon.svg';
import {ReactComponent as MaterialIcon} from 'assets/icons/MaterialIcon.svg';
import {ReactComponent as LaborIcon} from 'assets/icons/LaborIcon.svg';
import {ReactComponent as OtherIcon} from 'assets/icons/OtherIcon.svg';
import {NumericFormat} from 'react-number-format';
import {LanguageContext} from 'context/LanguageProvider';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import ExpandIcon from '@mui/icons-material/Expand';
import {T} from 'utils/i18n-utils';
import {toDate} from 'utils/datetime';
import {useFormatDate} from 'hooks/useFormatDate';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {SearchInput} from 'components/SearchInput';
import {EmptySection} from 'components/EmptySection';
import {ServiceOrderLabels, ServiceOrderType} from 'models/service-order';

const articleTypes = [
  {
    value: ArticleType.LABOR,
    label: 'Labor',
  },
  {
    value: ArticleType.MATERIAL,
    label: 'Material',
  },
  {
    value: ArticleType.PACKAGE,
    label: 'Package',
    isPackage: true,
  },
  {
    value: ArticleType.OTHER,
    label: 'Other',
  },
];

interface Props {
  formikContractServiceComponent: FormikProps<ContractServiceForm>;
  formikContractServiceInitialValues: any;
  isDialogOpen: boolean;
  loading: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isEditForm: boolean;
  updateContract: (obj: any) => void;
  components: ContractComponentView[];
  contractId: string;
  search: (value: string) => void;
}

export const MutationService = ({
  formikContractServiceComponent,
  formikContractServiceInitialValues,
  isDialogOpen,
  setIsDialogOpen,
  isEditForm,
  updateContract,
  components,
  contractId,
  loading,
  search,
}: Props) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);
  const formatDate = useFormatDate();
  const currentCurrency = useCurrentCurrency();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [showAll, setShowAll] = useState(false);
  const [visibleItems, setVisibleItems] = useState(5);

  const handleCancel = () => {
    setIsDialogOpen(false);
    search('');
  };

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    event.currentTarget.focus();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleUnits = () => {
    if (showAll) {
      setVisibleItems(5);
      setShowAll(false);
    } else {
      setVisibleItems(
        formikContractServiceComponent.values.elevators?.length || 0,
      );
      setShowAll(true);
    }
  };

  useEffect(() => {
    setShowAll(false);
    setVisibleItems(5);
  }, [isDialogOpen]);

  const visibleElevators =
    formikContractServiceComponent.values.elevators?.slice(0, visibleItems) ||
    [];

  useEffect(() => {
    const defaultPackageValues = {
      laborPercentage:
        formikContractServiceComponent.values.costType === ArticleType.PACKAGE
          ? formikContractServiceComponent.values.costPackage
              ?.laborPercentage || 50
          : 0,
      materialPercentage:
        formikContractServiceComponent.values.costType === ArticleType.PACKAGE
          ? formikContractServiceComponent.values?.costPackage
              ?.materialPercentage || 50
          : 0,
    };
    formikContractServiceComponent.setFieldValue('costPackage', {
      ...formikContractServiceComponent.values.costPackage,
      ...defaultPackageValues,
    });
  }, [formikContractServiceComponent.values.costType]);

  const updateServiceMutation = () => {
    const index = components.findIndex(
      (c) => c.id === formikContractServiceComponent.values?.id,
    );

    const updatedComponentsToSave = components.filter(
      (c) => c.id !== formikContractServiceComponent.values?.id,
    );

    const {values} = formikContractServiceComponent;
    const elevatorsToSave = values.elevators
      .filter((e) => e.isChecked)
      // Nullify invoice and order generation jobs if they have no time numbers set and is monthly time unit
      .map((elevator) => ({
        ...elevator,
        invoiceJob:
          elevator.invoiceJob?.timeUnit === ContractTimeUnit.MONTHLY &&
          !elevator.invoiceJob?.timeNumbers.length
            ? null
            : {...elevator.invoiceJob},
        orderGenerationJob:
          ((elevator.orderGenerationJob?.timeUnit ===
            ContractTimeUnit.MONTHLY ||
            elevator.orderGenerationJob?.timeUnit === ContractTimeUnit.NONE) &&
            !elevator.orderGenerationJob?.timeNumbers.length) ||
          !values.isAutomaticJobCycle ||
          !values.firstOrderDate
            ? null
            : {...elevator.orderGenerationJob},
        orderType: values?.orderType,
      }));

    const existingData = componentsToMutate(updatedComponentsToSave);

    const itemToMutate = {
      firstInvoiceDate: values.firstInvoiceDate
        ? formatDate(values.firstInvoiceDate, 'yyyy-MM-dd')
        : null,
      firstOrderDate:
        values.firstOrderDate && values?.isAutomaticJobCycle
          ? formatDate(values.firstOrderDate, 'yyyy-MM-dd')
          : null,
      group: values?.group,
      name: values.name,
      costPackage: values?.costPackage,
      costType: values?.costType,
      elevators: elevatorsToSave,
      orderType: values?.orderType,
    } as UpdateContractComponents;

    existingData.splice(index, 0, itemToMutate);

    updateContract({
      body: {components: existingData},
      contractId,
    });
  };

  const createServiceMutation = () => {
    const updatedComponentsToSave = components.filter(
      (c) => c.id !== formikContractServiceComponent.values?.id,
    );
    const {values} = formikContractServiceComponent;

    const elevatorsToSave = values.elevators.filter((e) => e.isChecked);

    const componentsToSave = [
      {
        firstInvoiceDate: values.firstInvoiceDate
          ? formatDate(values.firstInvoiceDate, 'yyyy-MM-dd')
          : null,
        firstOrderDate:
          values.firstOrderDate && values?.isAutomaticJobCycle
            ? formatDate(values.firstOrderDate, 'yyyy-MM-dd')
            : null,
        group: values?.group,
        name: values.name,
        costPackage: values?.costPackage,
        costType: values?.costType,
        elevators: elevatorsToSave || [],
        orderType: values?.orderType,
      },
      ...componentsToMutate(updatedComponentsToSave),
    ];

    updateContract({
      body: {components: componentsToSave},
      contractId,
    });
  };

  const resetForm = () => {
    formikContractServiceComponent.resetForm({
      values: formikContractServiceInitialValues,
    });
  };

  const columns: {
    name: string;
    align?: TableCellProps['align'];
    width?: TableCellProps['width'];
  }[] = [
    {name: 'Serial Number', align: 'left', width: '20%'},
    {name: 'Building', width: '10%'},
    {
      name: 'Unit Address',
      width: formikContractServiceComponent.values.isAutomaticJobCycle
        ? '22%'
        : '37%',
    },
    {name: 'Job Frequency', align: 'left', width: '15%'},
    {name: 'Invoice frequency', align: 'left', width: '15%'},
    {name: 'Invoice Price (Excl. VAT)', align: 'right', width: '18%'},
  ];

  const clearElevators = () => {
    const updatedItems = formikContractServiceComponent.values.elevators.map(
      (elevator) => ({...elevator, isChecked: false}),
    );
    formikContractServiceComponent.setFieldValue('elevators', updatedItems);
  };

  const handleCheckboxChange = (
    item: ContractServiceFormElevator,
    isChecked: boolean,
  ) => {
    const updatedItems = formikContractServiceComponent.values.elevators.map(
      (elevator) => {
        if (elevator.elevatorId === item.elevatorId) {
          return {...elevator, isChecked};
        }
        return elevator;
      },
    );

    formikContractServiceComponent.setFieldValue('elevators', updatedItems);
  };
  const renderClearSelectionsButton = () => {
    const numberOfUnits =
      formikContractServiceComponent.values.elevators.filter(
        (el) => el?.isChecked,
      ).length;

    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Button
          buttonProps={{
            variant: 'outlined',
            size: 'small',
            sx: {
              background: 'transparent',
              marginLeft: '1.5em',
            },
            endIcon: <CloseIcon />,
            onClick: () => clearElevators(),
          }}>
          {numberOfUnits === 1
            ? T('1 Unit Selected')
            : T('{{numberOfUnits}} Units Selected', {
                numberOfUnits,
              })}
        </Button>
        <SearchInput
          placeholder={t('Search by number, name, address etc.')}
          onValueChanged={(val) => {
            search(val);
          }}
          variant="outlined"
        />
      </Box>
    );
  };

  const handleJobFrequencyChange =
    (key: string) => (value: ContractComponentElevator[]) =>
      formikContractServiceComponent.setFieldValue(key, value);

  const lengthOfElevators =
    formikContractServiceComponent.values?.elevators?.length;

  const selectedElevators = useMemo(
    () =>
      formikContractServiceComponent.values.elevators.filter(isUnitSelected),
    [formikContractServiceComponent.values.elevators],
  );

  return (
    <Dialog
      title={isEditForm ? t('Edit Service') : t('Add Service')}
      onCancel={() => {
        handleCancel();
        resetForm();
      }}
      dialogProps={{
        open: isDialogOpen || false,
        maxWidth: 'lg',
      }}
      disableSaveBtn={
        !!Object.keys(formikContractServiceComponent.errors).length ||
        (formikContractServiceComponent.values.isAutomaticJobCycle &&
          !formikContractServiceComponent.values.firstOrderDate) ||
        (formikContractServiceComponent.values.isAutomaticJobCycle &&
          !formikContractServiceComponent.values.orderType)
      }
      saveButtonText={isEditForm ? t('Save') : t('Add Service')}
      isSaving={loading}
      onSave={() => {
        if (isEditForm) {
          updateServiceMutation();
        } else {
          createServiceMutation();
        }
        setIsDialogOpen(false);
        resetForm();
      }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '0em 0em 1em 0em',
        }}>
        <BasicInfoIcon fontSize="2rem" />
        <Typography
          variant="h5"
          color={theme.palette.text.primary}
          sx={{paddingLeft: '0.5em'}}>
          {t('Basic')}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={7}>
          <FormInput
            fieldProps={{
              label: 'Service Name',
              name: 'name',
              value: formikContractServiceComponent.values.name,
              onChange: formikContractServiceComponent.handleChange,
              onBlur: formikContractServiceComponent.handleBlur,
              required: true,
              helperText:
                formikContractServiceComponent.touched.name &&
                formikContractServiceComponent.errors.name,
              error:
                !!formikContractServiceComponent.errors.name &&
                formikContractServiceComponent.touched.name,
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <>
            <Tooltip
              title={t(
                getArticleTypeText(
                  formikContractServiceComponent.values.costType!,
                ),
              )}
              arrow
              placement="top">
              <Box
                onClick={handleClick}
                sx={{
                  width: '100%',
                  borderRadius: '4px',
                  height: 42,
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  background: '#00D1FF0A',
                  padding: '1em',
                  border: '1px solid #E4E9F2',
                }}
                tabIndex={0}>
                {formikContractServiceComponent.values.costType ===
                ArticleType.PACKAGE ? (
                  <PackageIcon fontSize="2rem" />
                ) : formikContractServiceComponent.values.costType ===
                  ArticleType.MATERIAL ? (
                  <MaterialIcon fontSize="2rem" />
                ) : formikContractServiceComponent.values.costType ===
                  ArticleType.LABOR ? (
                  <LaborIcon fontSize="2rem" />
                ) : (
                  <OtherIcon />
                )}
                <Typography variant="body1" fontSize="1.2rem" pl={2}>
                  {t(
                    getArticleTypeText(
                      formikContractServiceComponent.values.costType!,
                    ),
                  )}
                </Typography>
              </Box>
            </Tooltip>
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              sx={{
                '& .MuiPaper-root': {
                  width: '350px',
                  minHeight: '250px',
                  pt: 1,
                  pb: 2,
                  px: 3,
                },
              }}>
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Typography
                    sx={{
                      py: 2,
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                    }}>
                    {t('Article Type')}
                  </Typography>

                  <Button
                    buttonProps={{
                      onClick: handleClose,
                      sx: {
                        mx: 0,
                        mr: -2,
                        p: 1,
                        minWidth: 0,
                      },
                    }}>
                    <CloseIcon />
                  </Button>
                </Box>

                <FormControl>
                  <RadioGroup name="radio-buttons-group">
                    {articleTypes.map((articleType) => (
                      <Box key={articleType.value}>
                        <FormRadio
                          value={articleType.value}
                          checked={
                            formikContractServiceComponent.values.costType ===
                            articleType.value
                          }
                          handleChange={(e) => {
                            formikContractServiceComponent.setFieldValue(
                              'costType',
                              e.target.value,
                            );
                          }}
                          label={
                            <Typography
                              variant="h6"
                              component="span"
                              fontSize="1.125rem"
                              fontWeight={400}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                              }}>
                              {t(articleType.label)}
                            </Typography>
                          }
                          radioProps={{
                            sx: {color: theme.palette.text.secondary},
                          }}
                        />
                        {formikContractServiceComponent.values.costType ===
                          articleType.value &&
                          articleType.isPackage && (
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              pt="1.8rem">
                              <Box>
                                <NumericFormat
                                  value={
                                    formikContractServiceComponent.values
                                      .costPackage?.laborPercentage
                                  }
                                  customInput={TextField}
                                  suffix="%"
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
                                  sx={{
                                    width: '100%',
                                    bgcolor: 'white',
                                    '& .MuiInputBase-root': {
                                      pr: 0,
                                    },
                                    '& .MuiOutlinedInput-input': {
                                      textAlign: 'right',
                                      background: '#FFFFFF',
                                    },
                                  }}
                                  isAllowed={(values) => {
                                    const {floatValue} = values;
                                    if (!floatValue) {
                                      return true;
                                    }

                                    if (floatValue < 0) {
                                      return false;
                                    }

                                    const maxValue = 100;

                                    return floatValue <= maxValue;
                                  }}
                                  InputProps={{
                                    name: 'costPackage.laborPercentage',
                                    placeholder: t(`e.g. 50%`),
                                    id: `costPackage.laborPercentage`,
                                    inputMode: 'numeric',
                                    error: !!getIn(
                                      formikContractServiceComponent.errors,
                                      'costPackage.laborPercentage',
                                    ),
                                    onBlur:
                                      formikContractServiceComponent.handleBlur,
                                    disabled:
                                      formikContractServiceComponent.values
                                        .costType !== ArticleType.PACKAGE,
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  label={t('Labor')}
                                  onValueChange={(values) => {
                                    formikContractServiceComponent.setFieldValue(
                                      'costPackage.laborPercentage',
                                      Number(values.value),
                                    );
                                  }}
                                  size="small"
                                />
                              </Box>

                              <Box sx={{ml: '1em'}}>
                                <NumericFormat
                                  value={
                                    formikContractServiceComponent.values
                                      .costType === ArticleType.PACKAGE
                                      ? 100 -
                                        Number(
                                          formikContractServiceComponent.values
                                            .costPackage?.laborPercentage,
                                        )
                                      : 0
                                  }
                                  customInput={TextField}
                                  suffix="%"
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
                                  sx={{
                                    width: '100%',
                                    bgcolor: 'white',
                                    '& .MuiInputBase-root': {
                                      pr: 0,
                                    },
                                    '& .MuiOutlinedInput-input': {
                                      textAlign: 'right',
                                      background: '#FFFFFF',
                                    },
                                  }}
                                  isAllowed={(values) => {
                                    const {floatValue} = values;
                                    if (!floatValue) {
                                      return true;
                                    }

                                    if (floatValue < 0) {
                                      return false;
                                    }

                                    const maxValue = 100;

                                    return floatValue <= maxValue;
                                  }}
                                  InputProps={{
                                    name: 'costPackage.materialPercentage',
                                    placeholder: t(`e.g. 20%`),
                                    id: `costPackage.materialPercentage`,
                                    inputMode: 'numeric',
                                    disabled: true,
                                    required: false,
                                    onBlur:
                                      formikContractServiceComponent.handleBlur,
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  label={t('Material')}
                                  onValueChange={(values) => {
                                    formikContractServiceComponent.setFieldValue(
                                      'costPackage.materialPercentage',
                                      Number(values.value),
                                    );
                                  }}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          )}
                      </Box>
                    ))}
                  </RadioGroup>
                </FormControl>

                <Box
                  sx={{
                    pt: 3,
                    pb: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                  <Button
                    label={t('Cancel')}
                    buttonProps={{
                      onClick: handleClose,
                    }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('Cancel')}
                    </Typography>
                  </Button>

                  <Button
                    label={t('Save')}
                    buttonProps={{
                      onClick: () => {
                        handleClose();
                      },
                      autoFocus: true,
                      variant: 'contained',
                    }}>
                    <Typography variant="subtitle2">{t('Save')}</Typography>
                  </Button>
                </Box>
              </>
            </Popover>
          </>
        </Grid>
        <Grid item xs={3}>
          <DatePicker
            defaultDate={
              formikContractServiceComponent.values.firstInvoiceDate
                ? toDate(formikContractServiceComponent.values.firstInvoiceDate)
                : null
            }
            getSelectedDate={(newValue) => {
              if (newValue)
                formikContractServiceComponent.setFieldValue(
                  'firstInvoiceDate',
                  newValue,
                );
            }}
            textFieldProps={{
              name: 'firstInvoiceDate',
              id: 'firstInvoiceDate',
              required: true,
              label: t('First Invoice Date'),
              helperText:
                formikContractServiceComponent.errors.firstInvoiceDate &&
                formikContractServiceComponent.touched.firstInvoiceDate
                  ? t(
                      `${formikContractServiceComponent.errors.firstInvoiceDate}`,
                    )
                  : '',
              error:
                !!formikContractServiceComponent.errors.firstInvoiceDate &&
                formikContractServiceComponent.touched.firstInvoiceDate,
              onBlur: formikContractServiceComponent.handleBlur,
            }}
          />
        </Grid>
      </Grid>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '3em 0em 1em 0em',
          justifyContent: 'space-between',
        }}>
        <Box>
          <Box display="flex">
            <LiftIcon fontSize="2rem" />
            <Typography
              variant="h5"
              color={theme.palette.text.primary}
              sx={{paddingLeft: '0.5em'}}>
              {t('Unit Settings')}
            </Typography>
          </Box>

          <Typography>
            {t('Select units for which this contract service will apply.')}
          </Typography>
        </Box>

        {renderClearSelectionsButton()}
      </Box>
      <Box display="flex" alignItems="center">
        <Switch
          value={formikContractServiceComponent.values.isAutomaticJobCycle}
          onChanged={(value) =>
            formikContractServiceComponent.setFieldValue(
              'isAutomaticJobCycle',
              value,
            )
          }
        />
        <Typography
          variant="body1"
          sx={{color: 'text.primary', padding: '1em 0em'}}>
          {t('Automatic job cycle')}
        </Typography>
      </Box>

      {!formikContractServiceComponent.values.isAutomaticJobCycle && (
        <Typography
          variant="body1"
          sx={{color: 'text.primary', padding: '0.5em 0em 1em 0em'}}>
          {t(
            'With this setting there will be no jobs created from this service',
          )}
        </Typography>
      )}

      {formikContractServiceComponent.values.isAutomaticJobCycle && (
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <FormControl fullWidth required>
              <InputLabel
                size="small"
                shrink
                variant="outlined"
                id="demo-simple-select-label">
                {t('Job type')}
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                label={t('Job type')}
                size="small"
                value={formikContractServiceComponent.values.orderType}
                required
                notched
                name="orderType"
                onBlur={formikContractServiceComponent.handleBlur}
                onChange={formikContractServiceComponent.handleChange}>
                {Object.values(ServiceOrderType).map((type, index) => (
                  <MenuItem value={type} key={index}>
                    {t(ServiceOrderLabels[type])}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <DatePicker
              defaultDate={
                formikContractServiceComponent.values.firstOrderDate
                  ? toDate(formikContractServiceComponent.values.firstOrderDate)
                  : null
              }
              getSelectedDate={(newValue) => {
                if (newValue)
                  formikContractServiceComponent.setFieldValue(
                    'firstOrderDate',
                    newValue,
                  );
              }}
              textFieldProps={{
                label: t('First job creation date'),
                required: true,
              }}
              disableLeapDay
            />
          </Grid>
        </Grid>
      )}

      <TableContainer>
        <TableHead sx={{display: 'block', borderBottom: '1px solid #8F9BB380'}}>
          <TableRow sx={{display: 'block'}}>
            {columns.map(
              (column) =>
                (column.name !== 'Job Frequency' ||
                  formikContractServiceComponent.values
                    .isAutomaticJobCycle) && (
                  <TableCell
                    key={column.name}
                    align={column.align || 'left'}
                    sx={{display: 'inline-block', padding: '1em 0em'}}
                    width={column.width}>
                    <Typography
                      variant="subtitle2"
                      color={theme.palette.text.secondary}>
                      {t(column.name).toUpperCase()}
                    </Typography>
                  </TableCell>
                ),
            )}
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            display: 'block',
          }}>
          {visibleElevators?.map((item, index) => {
            const price =
              formikContractServiceComponent.values.elevators[index].price /
              10 ** currentCurrency.fractionDigits;
            return (
              <TableRow
                sx={{
                  width: '100%',
                  display: 'block',
                  cursor: 'pointer',
                  '&:hover': {
                    background: '#F2F6F8',
                  },
                }}
                key={`${item.elevatorId}-${index}`}>
                <TableCell
                  sx={{
                    width: '20%',
                    display: 'inline-block',
                    padding: '0em 0.5em',
                    borderBottom: 'none',
                  }}>
                  <FormCheckbox
                    checked={item.isChecked || false}
                    name={`isChecked-${index}`}
                    handleChange={() =>
                      handleCheckboxChange(item, !item.isChecked)
                    }
                    label={item.externalId}
                    typographyProps={{
                      variant: 'body2',
                    }}
                  />
                </TableCell>

                <TableCell
                  sx={{
                    width: '10%',
                    display: 'inline-block',
                    borderBottom: 'none',
                    padding: '0.5em 0em',
                  }}>
                  <Typography
                    color={theme.palette.text.primary}
                    variant="body2">
                    {item.buildingLocation || '-'}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    width: formikContractServiceComponent.values
                      .isAutomaticJobCycle
                      ? '22%'
                      : '37%',
                    display: 'inline-block',
                    borderBottom: 'none',
                    padding: '0.5em 0.5em 0.5em 0em',
                  }}>
                  <Typography
                    color={theme.palette.text.primary}
                    variant="body2">
                    {item.address || '-'}
                  </Typography>
                </TableCell>

                {formikContractServiceComponent.values.isAutomaticJobCycle && (
                  <TableCell
                    sx={{
                      width: '15%',
                      display: 'inline-block',
                      textAlign: 'right',
                      borderBottom: 'none',
                      padding: '0em 1.5em 0em 0em',
                    }}>
                    <JobFrequencyPicker
                      componentId={item.elevatorId}
                      units={formikContractServiceComponent.values.elevators}
                      onChange={handleJobFrequencyChange('elevators')}
                    />
                  </TableCell>
                )}

                <TableCell
                  sx={{
                    width: '15%',
                    display: 'inline-block',
                    textAlign: 'right',
                    borderBottom: 'none',
                    padding: '0em 1.5em 0em 0em',
                  }}>
                  <InvoiceFrequencyPicker
                    formik={formikContractServiceComponent}
                    componentId={item.elevatorId}
                  />
                </TableCell>

                <TableCell
                  sx={{
                    width: '18%',
                    display: 'inline-block',
                    textAlign: 'right',
                    borderBottom: 'none',
                    padding: '1em 0.5em 1em 0em',
                  }}>
                  <NumericFormat
                    value={price}
                    customInput={TextField}
                    prefix={currentCurrency.symbol}
                    allowLeadingZeros={false}
                    decimalScale={2}
                    decimalSeparator={
                      selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
                    }
                    thousandSeparator={
                      selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
                    }
                    sx={{
                      width: '100%',
                      bgcolor: 'white',
                      '& .MuiInputBase-root': {
                        pr: 0,
                      },
                      '& .MuiOutlinedInput-input': {
                        textAlign: 'right',
                        background: '#FFFFFF',
                      },
                    }}
                    isAllowed={(values) => {
                      const {floatValue} = values;
                      if (!floatValue) {
                        return true;
                      }

                      if (floatValue < 0) {
                        return false;
                      }

                      const maxValue = 1000000000000;

                      return floatValue <= maxValue;
                    }}
                    InputProps={{
                      name: 'price',
                      id: `price`,
                      inputMode: 'numeric',
                      error: !!getIn(
                        formikContractServiceComponent.errors,
                        `elevators[${index}].price`,
                      ),
                      onBlur: formikContractServiceComponent.handleBlur,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    label={t('Invoice Price (Excl. VAT)')}
                    onValueChange={(values) => {
                      const {floatValue} = values;

                      if (floatValue) {
                        const newPrice = floatValue;

                        if (index === 0) {
                          formikContractServiceComponent.setFieldValue(
                            `elevators[${index}].price`,
                            newPrice * 10 ** currentCurrency.fractionDigits,
                          );

                          const updatedElevators =
                            formikContractServiceComponent.values.elevators.map(
                              (elevator) => ({
                                ...elevator,
                                price:
                                  newPrice *
                                  10 ** currentCurrency.fractionDigits,
                              }),
                            );
                          formikContractServiceComponent.setFieldValue(
                            'elevators',
                            updatedElevators,
                          );
                        } else {
                          formikContractServiceComponent.setFieldValue(
                            `elevators[${index}].price`,
                            newPrice * 10 ** currentCurrency.fractionDigits,
                          );
                        }
                      }
                    }}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            );
          })}
          {!visibleElevators.length && (
            <EmptySection
              illustration="clipboard"
              size="tiny"
              containerStyle={{my: '4em'}}
              label="There are no entires for the applied filters."
            />
          )}
        </TableBody>
      </TableContainer>
      <TableContainer>
        <TableBody sx={{display: 'block'}}>
          {formikContractServiceComponent.values.elevators?.length > 2 && (
            <TableRow
              sx={{
                width: '100%',
                display: 'block',
                padding: '0.5em 0em',
              }}>
              <TableCell
                sx={{
                  width: '62%',
                  display: 'inline-block',
                  padding: '0em',
                }}>
                <Button
                  label={
                    showAll
                      ? 'Hide Units'
                      : `Show ${
                          lengthOfElevators - 5 < 0 ? 0 : lengthOfElevators - 5
                        } more units`
                  }
                  buttonProps={{
                    variant: 'text',
                    size: 'large',
                    sx: {color: '#0092B2', letterSpacing: '0.02em'},
                    startIcon: <ExpandIcon fill="#0092B2" />,
                    onClick: handleToggleUnits,
                  }}
                />
              </TableCell>
            </TableRow>
          )}

          <Divider
            sx={{width: '100%', borderColor: '#8F9BB380', padding: '0.2em'}}
          />

          <TableRow
            sx={{
              width: '100%',
              display: 'block',
              padding: '0.5em 0em',
            }}>
            <TableCell sx={{width: '62%', display: 'inline-block'}} />

            <TableCell
              sx={{
                display: 'inline-block',
                borderBottom: 'none',
                width: '25%',
                textAlign: 'left',
              }}>
              <Typography variant="h6">
                {t('Total contract value per year (excl. VAT)')}
              </Typography>
            </TableCell>

            <TableCell
              sx={{
                display: 'inline-block',
                textAlign: 'right',
                borderBottom: 'none',
                padding: '0em',
                width: '13%',
              }}>
              <Typography variant="h6">
                {formatCurrency(
                  calculateContractInvoicePriceTotal(selectedElevators) /
                    10 ** currentCurrency.fractionDigits,
                  {
                    currency: currentCurrency.code,
                  },
                )}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    </Dialog>
  );
};
