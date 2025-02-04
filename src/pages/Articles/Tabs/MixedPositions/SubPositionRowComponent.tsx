import React, {useContext, useState} from 'react';
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import NewArticleAutoComplete from 'components/NewArticleAutocomplete';
import TableCell from 'components/Table/TableCell';
import TableRow from 'components/Table/TableRow';
import {FormInput} from 'components/form/FormInput';
import {LanguageContext} from 'context/LanguageProvider';
import {
  ArticleType,
  ArticleView,
  CreateArticleRecord,
  MixedPositionRow,
  SubPositionFormValues,
  SubPositionRow,
  UpdateArticleRecord,
  UpdateArticleSubAssociationBody,
  UpdateArticleSubAssociationRecord,
} from 'models/article';
import {
  convertNumberToAmountNumber,
  formatCurrency,
  getDecimalSeparator,
  getThousandsSeparator,
  useCurrentCurrency,
} from 'utils/currency';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import DOMPurify from 'dompurify';
import {Receipt, ReceiptOutlined, NoteAltOutlined} from '@mui/icons-material';
import NewArticleTypeCard from 'components/NewArticleTypeCard';
import {NumericFormat} from 'react-number-format';
import {Controller, useForm} from 'react-hook-form';
import {FormSelect} from 'components/form/FormSelect';
import {MeasurementUnit, createMeasurementOptions} from 'models/articleForm';
import {useTranslation} from 'react-i18next';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {
  fetchArticleSubAssociations,
  useCreateArticleSubAssociation,
  useUpdateArticleSubAssociation,
} from 'hooks/reactQuery/useArticle';
import {transformToSubPositionRow} from 'utils/article-utils';
import {useVats} from 'hooks/reactQuery/useVats';
import {AmountRecord, Resource, RestError} from 'models/misc';
import {
  RefetchOptions,
  RefetchQueryFilters,
  QueryObserverResult,
} from 'react-query';
import {useTheme} from '@mui/material/styles';
import {useSnackbar} from 'hooks/useSnackbar';
import {removeHtmlTags} from 'utils/rich-field-string';
import {DeleteEventState, getIconByType} from '.';
import {Actions} from './Actions';

const sanitizedTextStyles = {
  maxWidth: 250,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  whiteSpace: 'normal',
  fontSize: '0.8rem',
};

type Props = {
  serviceCompanyId: string;
  row: MixedPositionRow;
  subPosition: SubPositionRow;
  subRows: Record<string, SubPositionRow[]>;
  setSubRows: React.Dispatch<
    React.SetStateAction<Record<string, SubPositionRow[]>>
  >;
  index: number;
  inputRefs: Record<string, React.RefObject<HTMLInputElement>>;
  subPositionEditState: {
    id: string | null;
    field: string | null;
    values: Partial<SubPositionFormValues>;
  };
  setSubPositionEditState: (
    value: React.SetStateAction<{
      id: string | null;
      field: string | null;
      values: Partial<SubPositionFormValues>;
    }>,
  ) => void;
  handleSubPositionEditStart: (
    subPosition: SubPositionRow,
    field: string,
  ) => void;
  handleDescriptionClick: (
    row: MixedPositionRow | SubPositionRow,
    positionType: 'mixed' | 'sub',
  ) => void;
  handlePreview: (parentId: string) => Promise<void>;
  setDeleteEventState: React.Dispatch<React.SetStateAction<DeleteEventState>>;
  refetchArticles: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined,
  ) => Promise<QueryObserverResult<Resource<ArticleView>, RestError>>;
};

const SubPositionRowComponent = ({
  serviceCompanyId,
  row,
  subPosition,
  subRows,
  setSubRows,
  index,
  handleSubPositionEditStart,
  subPositionEditState,
  inputRefs,
  setSubPositionEditState,
  handleDescriptionClick,
  handlePreview,
  setDeleteEventState,
  refetchArticles,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const currentCurrency = useCurrentCurrency();
  const {language: selectedLng} = useContext(LanguageContext);
  const {showError} = useSnackbar();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openPopover, setOpenPopover] = useState(false);

  const {data: taxRates} = useVats();

  const {mutateAsync: createArticleSubPosition} =
    useCreateArticleSubAssociation('Sub-Position created successfully');

  const {mutateAsync: updateArticleSubPosition, isLoading: isUpdating} =
    useUpdateArticleSubAssociation('');

  const {
    control: subPositionControl,
    setValue: setSubPositionValue,
    watch: watchSubPositionValues,
  } = useForm<Record<string, Partial<SubPositionFormValues>>>({
    shouldUnregister: false,
    defaultValues: {},
  });

  const resetEditState = () => {
    setSubPositionEditState({id: null, field: null, values: {}});
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenPopover(true);
    setSubPositionEditState({
      id: subPosition.id,
      field: 'type',
      values: {...subPosition},
    });
  };

  const handleClosePopover = () => {
    setOpenPopover(false);
    setAnchorEl(null);

    resetEditState();
  };

  const resetAndUpdateSubRows = async (parentId: string) => {
    setSubPositionEditState({id: null, field: null, values: {}});
    const subAssociations = await fetchArticleSubAssociations(parentId);
    const transformedSubPositions = subAssociations.map(
      transformToSubPositionRow,
    );
    setSubRows((prev) => ({
      ...prev,
      [parentId]: transformedSubPositions,
    }));
  };

  const handleSaveType = async (
    newType: ArticleType,
    subPositionId?: string,
  ) => {
    if (!subPositionId) return;

    setSubPositionEditState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        type: newType,
      },
    }));

    let seqNumber = 0;

    const parentId = Object.keys(subRows).find((key) =>
      subRows[key]?.some((sub, indexPos) => {
        if (sub.id === subPositionId) {
          seqNumber = indexPos;
          return true;
        }
        return false;
      }),
    );

    if (seqNumber === -1) {
      seqNumber = 0;
    }

    if (parentId) {
      await updateArticleSubPosition({
        articleId: parentId,
        associationId: subPositionEditState.id!,
        article: {
          type: newType as ArticleType,
        },
        seqNumber,
      });

      handleClosePopover();

      resetAndUpdateSubRows(parentId!);
    }
  };

  const handleSubPositionArticle = async (
    subPositionId: string,
    updatedBody: CreateArticleRecord | UpdateArticleRecord,
  ) => {
    const parentId = Object.keys(subRows).find((key) =>
      subRows[key]?.some((sub) => sub.id === subPositionId),
    );

    if (!parentId) return;

    if (
      subPositionEditState.id === subPositionId &&
      !subPositionId.includes('sub')
    ) {
      const articleToUpdate =
        subPositionEditState.values.name !== updatedBody.name && !updatedBody.id
          ? ({name: updatedBody.name} as UpdateArticleSubAssociationBody)
          : (updatedBody as UpdateArticleSubAssociationBody);

      try {
        await updateArticleSubPosition({
          articleId: parentId,
          associationId: subPositionId,
          article: articleToUpdate,
        });
        await resetAndUpdateSubRows(parentId);
      } catch (error) {
        showError(error);
      }
    } else {
      const isCreateArticleRecord = (
        body: CreateArticleRecord | UpdateArticleRecord,
      ): body is CreateArticleRecord => 'serviceCompanyId' in body;

      // Make a deep copy of updatedBody for creation and remove the id property.
      const articleBody = JSON.parse(JSON.stringify(updatedBody));
      delete articleBody.id;

      if (isCreateArticleRecord(updatedBody)) {
        try {
          const currentSubAssociations = await fetchArticleSubAssociations(
            parentId,
          );
          await createArticleSubPosition({
            articleId: parentId,
            body: {
              articleId: updatedBody.id!,
              article: articleBody,
              quantity: 1,
              seqNumber: currentSubAssociations.length || 0,
            },
          });
        } catch (error) {
          showError(error);
        }
        await resetAndUpdateSubRows(parentId);
      } else {
        try {
          await updateArticleSubPosition({
            articleId: parentId,
            associationId: subPositionId,
            article: updatedBody as UpdateArticleSubAssociationBody,
          });
        } catch (error) {
          showError(error);
        }
        resetEditState();
      }
    }
  };

  const onChangePercentageVat = async (
    event: SelectChangeEvent<string>,
    subPositionId: string,
  ) => {
    const selectedVatId = event.target.value;
    const taxRate = taxRates?.find((rate) => rate.id === selectedVatId);

    if (!taxRate) return;

    const parentId = Object.keys(subRows).find((key) =>
      subRows[key]?.some((sub) => {
        if (sub.id === subPositionId) {
          return true;
        }
        return false;
      }),
    );

    const updatedUnitSellingAmount: AmountRecord = {
      netAmount: subPosition.article.unitSellingAmount.netAmount,
      currency: currentCurrency.code || 'EUR',
      vatId: selectedVatId,
      vatName: taxRate?.name || '',
      percentageVat: taxRate?.percentage || 0,
    };

    await updateArticleSubPosition({
      articleId: parentId!,
      associationId: subPositionId,
      article: {unitSellingAmount: updatedUnitSellingAmount},
      quantity: subPosition?.quantity,
      seqNumber: subPosition?.seqNumber,
    });

    resetEditState();

    refetchArticles();
  };

  const onChangeUnit = async (newUnit: string, subPositionId: string) => {
    const parentId = Object.keys(subRows).find((key) =>
      subRows[key]?.some((sub) => {
        if (sub.id === subPositionId) {
          return true;
        }
        return false;
      }),
    );

    try {
      await updateArticleSubPosition({
        articleId: parentId!,
        associationId: subPositionId,
        article: {unit: newUnit},
        quantity: subPosition?.quantity,
        seqNumber: subPosition?.seqNumber,
      });

      resetAndUpdateSubRows(parentId!);
    } catch (error) {
      showError(error);
    }
  };

  const handleSubPositionMarginChange = (newMargin: number) => {
    const buyingPrice =
      (subPosition?.article.unitPurchaseAmount?.netAmount ?? 0) /
      10 ** currentCurrency.fractionDigits;

    const newSellingPrice = buyingPrice * (1 + newMargin / 100);

    setSubPositionEditState({
      ...subPositionEditState,
      values: {
        ...subPositionEditState.values,
        margin: newMargin,
        unitSellingAmount: {
          netAmount: Number(newSellingPrice) ?? 0,
          percentageVat: subPosition?.article.unitSellingAmount?.percentageVat,
          currency: subPosition?.article.unitSellingAmount?.currency || 'EUR',
        },
      },
    });
  };

  const handleSubPositionSellingPriceChange = (newSellingPrice: number) => {
    const buyingPrice =
      (subPosition?.article.unitPurchaseAmount?.netAmount ?? 0) /
      10 ** currentCurrency.fractionDigits;

    const newMargin = ((newSellingPrice - buyingPrice) / buyingPrice) * 100;

    setSubPositionEditState({
      ...subPositionEditState,
      values: {
        ...subPositionEditState.values,
        margin: newMargin,
        unitSellingAmount: {
          netAmount: Number(newSellingPrice) ?? 0,
          percentageVat: subPosition?.article.unitSellingAmount?.percentageVat,
          currency: subPosition?.article.unitSellingAmount?.currency || 'EUR',
        },
      },
    });
  };

  const handleSaveSubPosition = async (
    subPositionId: string,
    field: string,
  ) => {
    if (!subPosition) return;

    const currentValue = subPosition[field as keyof SubPositionRow];

    const newValue =
      subPositionEditState.values[field as keyof SubPositionFormValues];

    if (newValue === undefined || newValue === currentValue) {
      resetEditState();
      return;
    }

    let seqNumber = 0;

    const parentId = Object.keys(subRows).find((key) =>
      subRows[key]?.some((sub, indexPos) => {
        if (sub.id === subPositionId) {
          seqNumber = indexPos;
          return true;
        }
        return false;
      }),
    );

    setSubRows((prev) => ({
      ...prev,
      [subPositionId]: prev[subPositionId]?.map((subPos) =>
        subPos.id === subPositionId ? {...subPos, [field]: newValue} : subPos,
      ),
    }));

    if (!subPositionId.includes('sub')) {
      const updatePayload: UpdateArticleSubAssociationRecord = {
        article: {},
      };

      if (field === 'externalId') {
        updatePayload.article.externalId = newValue as string;
      } else if (field === 'name') {
        updatePayload.article.name = newValue as string;
      } else if (field === 'description') {
        updatePayload.article.description = newValue as string;
      } else if (field === 'quantity') {
        updatePayload.quantity = newValue as number;
      } else if (field === 'unitPurchaseAmount') {
        const newBuyingPrice =
          subPositionEditState.values.unitPurchaseAmount?.netAmount ?? 0;

        updatePayload.article.unitPurchaseAmount = {
          netAmount: convertNumberToAmountNumber(
            newBuyingPrice ?? 0,
            currentCurrency,
          ),
          percentageVat: subPosition?.article.unitPurchaseAmount?.percentageVat,
          currency: subPosition?.article.unitPurchaseAmount?.currency || 'EUR',
        };
      } else if (field === 'unitSellingAmount') {
        const newSellingPrice =
          subPositionEditState.values.unitSellingAmount?.netAmount ?? 0;

        updatePayload.article.unitSellingAmount = {
          netAmount: convertNumberToAmountNumber(
            newSellingPrice ?? 0,
            currentCurrency,
          ),
          percentageVat: subPosition?.article.unitSellingAmount?.percentageVat,
          currency: subPosition?.article.unitSellingAmount?.currency || 'EUR',
        };
      } else if (field === 'margin') {
        const newSellingPrice =
          subPositionEditState.values.unitSellingAmount?.netAmount ?? 0;

        updatePayload.article.unitSellingAmount = {
          netAmount: convertNumberToAmountNumber(
            newSellingPrice ?? 0,
            currentCurrency,
          ),
          percentageVat: subPosition?.article.unitSellingAmount?.percentageVat,
          currency: subPosition?.article.unitSellingAmount?.currency || 'EUR',
        };
      }

      if (Object.keys(updatePayload).length > 0) {
        try {
          await updateArticleSubPosition({
            articleId: parentId!,
            associationId: subPositionId,
            article: updatePayload.article,
            quantity: updatePayload.quantity,
            seqNumber,
          });
          resetAndUpdateSubRows(parentId!);
          refetchArticles();
        } catch (error) {
          showError(error);
        } finally {
          resetEditState();
        }
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    activeRow: SubPositionRow,
    field: string,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveSubPosition(activeRow.id, field);
    }
  };

  return (
    <TableRow
      key={`${row.data.id}-sub-${index}`}
      testId={`position-row-${row.data.id}`}
      sx={{
        background: '#f7f9fc',
        padding: '0px',
        pointerEvents: isUpdating ? 'none' : 'auto',
      }}>
      <TableCell
        noPadding
        onDoubleClick={() =>
          handleSubPositionEditStart(subPosition, 'externalId')
        }>
        {subPositionEditState.field === 'externalId' &&
        subPositionEditState.id === subPosition.id ? (
          <FormInput
            ref={inputRefs[subPosition.id]}
            containerStyles={{width: '100%'}}
            fieldProps={{
              value: subPositionEditState.values.externalId || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setSubPositionEditState({
                  ...subPositionEditState,
                  values: {
                    ...subPositionEditState.values,
                    externalId: e.target.value,
                  },
                });
              },
              onBlur: () =>
                handleSaveSubPosition(subPosition.id!, 'externalId'),
              onKeyDown: (e: React.KeyboardEvent) =>
                handleKeyDown(e, subPosition, 'externalId'),
              sx: {
                '& .Mui-focused': {
                  border: '2px solid #000034',
                  borderRadius: '4px',
                },
              },
            }}
          />
        ) : (
          <Typography sx={{padding: '0px 12px'}} variant="body2">
            {subPosition?.article.externalId}
          </Typography>
        )}
      </TableCell>

      <TableCell
        noPadding
        onDoubleClick={() => handleSubPositionEditStart(subPosition, 'name')}>
        {subPositionEditState.field === 'name' &&
        subPositionEditState.id === subPosition.id ? (
          <NewArticleAutoComplete
            onBlur={() =>
              handleSaveSubPosition(subPosition.id, subPositionEditState.field!)
            }
            initialValue={subPosition.article}
            onArticleSelect={handleSubPositionArticle}
            rowId={subPosition.id!}
            serviceCompanyId={serviceCompanyId}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0px 12px',
              border: subPosition.article.name ? 'none' : '2px solid red',
            }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                width: '100%',
                paddingRight: '6px',
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                <SubdirectoryArrowRightIcon
                  sx={{color: theme.palette.text.secondary}}
                />

                <Typography
                  sx={{
                    ...sanitizedTextStyles,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(subPosition?.article.name || ''),
                  }}
                />
              </Box>

              <IconButton
                onClick={() => handleDescriptionClick(subPosition, 'sub')}
                sx={{
                  color: removeHtmlTags(subPosition?.article.description || '')
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                }}>
                {removeHtmlTags(subPosition?.article.description || '') !==
                '' ? (
                  <Tooltip
                    title={
                      <div>
                        <Typography
                          sx={{
                            ...sanitizedTextStyles,
                          }}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              subPosition.article.description,
                            ),
                          }}
                        />
                      </div>
                    }
                    arrow
                    placement="top">
                    <NoteAlt fontSize="small" />
                  </Tooltip>
                ) : (
                  <NoteAltOutlined fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
        )}
      </TableCell>

      <TableCell
        noPadding
        align="center"
        onDoubleClick={(event) => handleOpenPopover(event)}>
        <Box
          sx={{
            width: '100%',
            borderRadius: '4px',
            height: 41,
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border:
              subPositionEditState.field === 'type' &&
              subPositionEditState.id === subPosition.id
                ? `2px solid ${theme.palette.primary.main}`
                : 'none',
          }}
          tabIndex={0}>
          {getIconByType(subPosition.article.type)}
        </Box>

        {subPositionEditState.field === 'type' &&
          subPositionEditState.id === subPosition.id && (
            <Popover
              open={openPopover}
              anchorEl={anchorEl}
              onClose={handleClosePopover}
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
              <NewArticleTypeCard
                control={subPositionControl}
                setValue={setSubPositionValue}
                onClose={handleClosePopover}
                onSave={handleSaveType}
                subPositionId={subPositionEditState.id!}
                selectedType={
                  (watchSubPositionValues('type') as unknown as ArticleType) ||
                  subPosition.article.type
                }
              />
            </Popover>
          )}
      </TableCell>

      <TableCell
        noPadding
        align="right"
        onDoubleClick={() =>
          handleSubPositionEditStart(subPosition, 'unitPurchaseAmount')
        }>
        {subPositionEditState.field === 'unitPurchaseAmount' &&
        subPositionEditState.id === subPosition.id ? (
          <NumericFormat
            value={
              subPositionEditState.values.unitPurchaseAmount?.netAmount || 0
            }
            onValueChange={(values) => {
              if (values.floatValue) {
                setSubPositionEditState({
                  ...subPositionEditState,
                  values: {
                    ...subPositionEditState.values,
                    unitPurchaseAmount: {
                      netAmount: values.floatValue ?? 0,
                      currency: currentCurrency.code || 'EUR',
                    },
                  },
                });
              }
            }}
            customInput={TextField}
            decimalScale={2}
            inputRef={inputRefs[subPosition.id]}
            fixedDecimalScale
            decimalSeparator={getDecimalSeparator(selectedLng)}
            thousandSeparator={getThousandsSeparator(selectedLng)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {currentCurrency.symbol}
                </InputAdornment>
              ),
              onBlur: () =>
                handleSaveSubPosition(subPosition.id!, 'unitPurchaseAmount'),
              onKeyDown: (e: React.KeyboardEvent) =>
                handleKeyDown(e, subPosition, 'unitPurchaseAmount'),
            }}
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {
                pr: 0,
              },
              '& .MuiOutlinedInput-input': {
                textAlign: 'right',
                width: '100%',
              },
              '& .Mui-focused': {
                border: '2px solid #000034',
                borderRadius: '4px',
              },
            }}
          />
        ) : (
          <Typography sx={{paddingRight: '12px'}} variant="body2">
            {formatCurrency(
              (subPosition?.article.unitPurchaseAmount?.netAmount ?? 0) /
                10 ** currentCurrency.fractionDigits,
              {
                currency: currentCurrency.code,
              },
            )}
          </Typography>
        )}
      </TableCell>

      <TableCell
        noPadding
        align="right"
        onDoubleClick={() => handleSubPositionEditStart(subPosition, 'margin')}>
        {subPositionEditState.field === 'margin' &&
        subPositionEditState.id === subPosition.id ? (
          <NumericFormat
            value={subPositionEditState.values.margin || 0}
            onValueChange={(values) =>
              handleSubPositionMarginChange(values.floatValue || 0)
            }
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            inputRef={inputRefs[subPosition.id]}
            fixedDecimalScale
            decimalSeparator={getDecimalSeparator(selectedLng)}
            thousandSeparator={getThousandsSeparator(selectedLng)}
            size="small"
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {
                pr: 0,
              },
              '& .MuiOutlinedInput-input': {
                textAlign: 'right',
                width: '100%',
              },
              '& .Mui-focused': {
                border: '2px solid #000034',
                borderRadius: '4px',
              },
            }}
            InputProps={{
              name: 'margin',
              id: `margin-${subPosition.id}`,
              inputMode: 'numeric',
              onBlur: () => handleSaveSubPosition(subPosition.id, 'margin'),
              onKeyDown: (e: React.KeyboardEvent) =>
                handleKeyDown(e, subPosition, 'margin'),
            }}
          />
        ) : (
          <Typography sx={{paddingRight: '12px'}} variant="body2">
            {Number.isFinite(
              (((subPosition.article.unitSellingAmount?.netAmount ?? 0) -
                (subPosition.article.unitPurchaseAmount?.netAmount ?? 0)) /
                (subPosition.article.unitPurchaseAmount?.netAmount ?? 0)) *
                100,
            ) &&
            (((subPosition.article.unitSellingAmount?.netAmount ?? 0) -
              (subPosition.article.unitPurchaseAmount?.netAmount ?? 0)) /
              (subPosition.article.unitPurchaseAmount?.netAmount ?? 0)) *
              100 !==
              0
              ? (
                  (((subPosition.article.unitSellingAmount?.netAmount ?? 0) -
                    (subPosition.article.unitPurchaseAmount?.netAmount ?? 0)) /
                    (subPosition.article.unitPurchaseAmount?.netAmount ?? 0)) *
                  100
                ).toFixed(2)
              : '-'}
            {Number.isFinite(
              (((subPosition.article.unitSellingAmount?.netAmount ?? 0) -
                (subPosition.article.unitPurchaseAmount?.netAmount ?? 0)) /
                (subPosition.article.unitPurchaseAmount?.netAmount ?? 0)) *
                100,
            ) &&
            (((subPosition.article.unitSellingAmount?.netAmount ?? 0) -
              (subPosition.article.unitPurchaseAmount?.netAmount ?? 0)) /
              (subPosition.article.unitPurchaseAmount?.netAmount ?? 0)) *
              100 !==
              0
              ? '%'
              : ''}
          </Typography>
        )}
      </TableCell>

      <TableCell
        noPadding
        align="right"
        onDoubleClick={() =>
          handleSubPositionEditStart(subPosition, 'unitSellingAmount')
        }>
        {subPositionEditState.field === 'unitSellingAmount' &&
        subPositionEditState.id === subPosition.id ? (
          <NumericFormat
            value={
              subPositionEditState.values.unitSellingAmount?.netAmount || 0
            }
            onValueChange={(values) =>
              handleSubPositionSellingPriceChange(values.floatValue ?? 0)
            }
            customInput={TextField}
            decimalScale={2}
            inputRef={inputRefs[subPosition.id]}
            fixedDecimalScale
            decimalSeparator={getDecimalSeparator(selectedLng)}
            thousandSeparator={getThousandsSeparator(selectedLng)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {currentCurrency.symbol}
                </InputAdornment>
              ),
              onBlur: () =>
                handleSaveSubPosition(subPosition.id!, 'unitSellingAmount'),
              onKeyDown: (e: React.KeyboardEvent) =>
                handleKeyDown(e, subPosition, 'unitSellingAmount'),
            }}
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {
                pr: 0,
              },
              '& .MuiOutlinedInput-input': {
                textAlign: 'right',
                width: '100%',
              },
              '& .Mui-focused': {
                border: '2px solid #000034',
                borderRadius: '4px',
              },
            }}
          />
        ) : (
          <Typography sx={{paddingRight: '12px'}} variant="body2">
            {formatCurrency(
              (subPosition?.article.unitSellingAmount?.netAmount ?? 0) /
                10 ** currentCurrency.fractionDigits,
              {
                currency: currentCurrency.code,
              },
            )}
          </Typography>
        )}
      </TableCell>

      <TableCell
        noPadding
        align="right"
        onDoubleClick={() =>
          handleSubPositionEditStart(subPosition, 'quantity')
        }>
        {subPositionEditState.field === 'quantity' &&
        subPositionEditState.id === subPosition.id ? (
          <NumericFormat
            value={subPositionEditState.values.quantity || 0}
            onValueChange={(values) => {
              const {floatValue} = values;
              setSubPositionEditState({
                ...subPositionEditState,
                values: {
                  ...subPositionEditState.values,
                  quantity: floatValue || 0,
                },
              });
            }}
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            inputRef={inputRefs[subPosition.id]}
            decimalSeparator={getDecimalSeparator(selectedLng)}
            thousandSeparator={getThousandsSeparator(selectedLng)}
            size="small"
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {
                pr: 0,
              },
              '& .MuiOutlinedInput-input': {
                textAlign: 'right',
                width: '100%',
              },
              '& .Mui-focused': {
                border: '2px solid #000034',
                borderRadius: '4px',
              },
            }}
            InputProps={{
              name: 'quantity',
              id: `quantity-${subPosition.id}`,
              inputMode: 'numeric',
              onBlur: () => handleSaveSubPosition(subPosition.id!, 'quantity'),
              onKeyDown: (e: React.KeyboardEvent) =>
                handleKeyDown(e, subPosition, 'quantity'),
            }}
          />
        ) : (
          <Typography sx={{paddingRight: '12px'}} variant="body2">
            {subPosition.quantity || 0}
          </Typography>
        )}
      </TableCell>

      <TableCell
        noPadding
        align="right"
        onDoubleClick={() => handleSubPositionEditStart(subPosition, 'vatId')}>
        {subPositionEditState.field === 'vatId' &&
        subPositionEditState.id === subPosition.id ? (
          <Controller
            name={`subPositions.${subPosition.id}.vatId`}
            control={subPositionControl}
            render={({field}) => (
              <FormControl fullWidth required={false}>
                <Select
                  {...field}
                  labelId={`select-tax-label-${subPosition.id}`}
                  size="small"
                  displayEmpty
                  value={field.value || ''}
                  onChange={(event) => {
                    onChangePercentageVat(event, subPosition.id);
                    field.onChange(event);
                  }}
                  onBlur={() =>
                    setSubPositionEditState({id: null, field: null, values: {}})
                  }
                  renderValue={(value) => {
                    const taxRate = taxRates?.find((item) => item.id === value);
                    return `${taxRate?.percentage || 0}%`;
                  }}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'right',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'right',
                    },
                    slotProps: {
                      paper: {
                        sx: {
                          maxWidth: '20rem',
                        },
                      },
                    },
                  }}
                  sx={{
                    border: '2px solid #000034',
                    borderRadius: '4px',
                  }}>
                  {taxRates?.map((taxRate) => (
                    <MenuItem
                      value={taxRate.id}
                      key={taxRate.id}
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}>
                      <Box display="flex" maxWidth="100%" gap={1}>
                        <Typography variant="body1" noWrap color="primary.dark">
                          {taxRate.name}
                        </Typography>
                        <Tooltip
                          title={taxRate.legalNote}
                          arrow
                          placement="top">
                          {taxRate.legalNote ? (
                            <Receipt fontSize="small" />
                          ) : (
                            <ReceiptOutlined fontSize="small" />
                          )}
                        </Tooltip>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {taxRate.percentage}%
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        ) : (
          // Show VAT from mixedPosition (not from subPosition)
          <Typography sx={{paddingRight: '12px'}} variant="body2">
            {row.data?.unitSellingAmount?.percentageVat
              ? `${row.data?.unitSellingAmount.percentageVat}%`
              : '-'}
          </Typography>
        )}
      </TableCell>

      <TableCell
        noPadding
        align="right"
        onDoubleClick={() => handleSubPositionEditStart(subPosition, 'unit')}>
        {subPositionEditState.field === 'unit' &&
        subPositionEditState.id === subPosition.id ? (
          <Controller
            name={`subPositions.${subPosition.id}.unit`}
            control={subPositionControl}
            render={({field}) => (
              <FormSelect
                labelId={`select-unit-label-${subPosition.id}`}
                label=""
                resetOption={{label: t('Select Unit')}}
                options={createMeasurementOptions(
                  selectedLng,
                  MeasurementUnit.UE,
                )}
                selectProps={{
                  ...field,
                  value: subPositionEditState.values.unit ?? '',
                  onChange: (event) => {
                    const selectedValue = event.target.value as string;
                    onChangeUnit(selectedValue, subPosition.id);
                    field.onChange(event);
                  },
                  placeholder: t('Select Unit'),
                  sx: {
                    width: '100%',
                    border: '2px solid #000034',
                    borderRadius: '4px',
                  },
                  onBlur: (event) => {
                    const selectedValue = event.target.value as string;
                    onChangeUnit(selectedValue, subPosition.id);
                    field.onChange(event);
                  },
                }}
              />
            )}
          />
        ) : (
          <Typography sx={{paddingRight: '12px'}} variant="body2">
            {t(subPosition.article?.unit!)}
          </Typography>
        )}
      </TableCell>

      <TableCell align="right" noPadding>
        <Typography sx={{paddingRight: '12px'}} variant="body2">
          {formatCurrency(
            (subPosition.quantity ?? 0) *
              ((subPosition.article.unitSellingAmount?.netAmount ?? 0) /
                10 ** currentCurrency.fractionDigits),
            {
              currency: currentCurrency.code,
            },
          )}
        </Typography>
      </TableCell>

      <TableCell noPadding align="right" sx={{paddingRight: '0.85em'}}>
        <Actions
          onPreview={() => handlePreview(row.data.id)}
          onDelete={() => {
            resetEditState();

            setDeleteEventState({
              userTypedName: '',
              isOpen: true,
              event: {
                type: 'sub',
                id: subPosition?.id,
                articleId: subPosition?.article.id,
                name: subPosition?.article.name,
                externalId: subPosition?.article.externalId,
              },
            });
          }}
          onRemove={() => {
            const parentId = Object.keys(subRows).find((key) =>
              subRows[key]?.some((sub) => sub.id === subPosition.id),
            );

            if (parentId) {
              setSubRows((prev) => ({
                ...prev,
                [parentId]: prev[parentId].filter(
                  (sub) => sub.id !== subPosition.id,
                ),
              }));
            }
          }}
          isDraft={subPosition.id.startsWith('sub')}
        />
      </TableCell>
    </TableRow>
  );
};

export default SubPositionRowComponent;
