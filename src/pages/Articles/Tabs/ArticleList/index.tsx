import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {convertNumberToAmountNumber, useCurrentCurrency} from 'utils/currency';
import {useQueryState} from 'hooks/useQueryState';
import {createEmptyResource, makePage, toggleOrder} from 'utils/paging';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useSearchValues} from 'hooks/useSearchValues';
import {Order, OrderByParams} from 'models/pagination';
import {TableColumnWithRender} from 'models/table';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {reduce} from 'lodash';
import {
  createQuickFilterOptions,
  filterOutQuickFilterOptions,
} from 'utils/filter';
import {Progress} from 'components/Progress';
import EmptyTable from 'components/Table/EmptyTable';
import PageHeaderContainer from 'components/PageHeaderContainer';
import Box from '@mui/material/Box';
import SearchInput from 'components/SearchInput/index';
import Filters from 'components/Filters';
import TextInput from 'components/TextInput';
import {CircularProgress, Typography} from '@mui/material';
import {Button} from 'components/Button';
import AddButton from 'components/AddButton';
import QuickFilter from 'components/QuickFilter';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import TableBody from 'components/Table/TableBody';
import TableRow from 'components/Table/TableRow';
import Pagination from 'components/Pagination';
import {OptionWithTranslationKey} from 'models/filter';
import {
  ARTICLE_TYPE_FILTER,
  ArticleFilterForm,
  ArticleOrderField,
  ArticleTableRow,
  ArticleType,
  ArticleView,
  QueryArticleParams,
} from 'models/article';
import {
  useAllArticles,
  useArticles,
  useArticleStatistics,
  useUpdateArticle,
} from 'hooks/reactQuery/useArticle';
import {
  aggregateArticleRow,
  createSearchQuery,
  getArticleTypes,
} from 'utils/article-utils';
import {useExportTableSheet} from 'hooks/useExport';
import {getPlainStringFromHtml} from 'utils/rich-field-string';
import {stringToTitleCase} from 'utils/utils';
import {FormSelect} from 'components/form/FormSelect';
import {createMeasurementOptions, MeasurementUnit} from 'models/articleForm';
import {LanguageContext} from 'context/LanguageProvider';
import TagCell from 'components/Tag/TagCell';
import {TagEntityType, TagRecord} from 'models/tag';

const pageSize = 25;

const QUICK_FILTER_OPTIONS: OptionWithTranslationKey[] =
  createQuickFilterOptions(ARTICLE_TYPE_FILTER);

const ArticleList = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const currentCurrency = useCurrentCurrency();
  const {language: selectedLng} = useContext(LanguageContext);

  const [search, setSearch] = useQueryState('searchArticles');

  const [selectedType, setSelectedType] = useQueryState<ARTICLE_TYPE_FILTER[]>(
    'selectedType',
    {
      defaultValue: [],
    },
  );

  const [selectedUnit, setSelectedUnit] = useQueryState<string | undefined>(
    'selectedUnit',
    {defaultValue: undefined},
  );

  const [sellingPriceMin, setSellingPriceMin] = useQueryState<
    number | undefined
  >('sellingPriceMin', {
    defaultValue: undefined,
  });
  const [sellingPriceMax, setSellingPriceMax] = useQueryState<
    number | undefined
  >('sellingPriceMax', {
    defaultValue: undefined,
  });

  const [buyingPriceMin, setBuyingPriceMin] = useQueryState<number | undefined>(
    'buyingPriceMin',
    {
      defaultValue: undefined,
    },
  );
  const [buyingPriceMax, setBuyingPriceMax] = useQueryState<number | undefined>(
    'buyingPriceMax',
    {
      defaultValue: undefined,
    },
  );

  const [vat, setVat] = useQueryState<number | undefined>('vat', {
    defaultValue: undefined,
  });

  const [storageLocation, setStorageLocation] = useQueryState<
    string | undefined
  >('storageLocation', {defaultValue: undefined});

  const [category, setCategory] = useQueryState<string | undefined>(
    'category',
    {defaultValue: undefined},
  );

  const [manufacturer, setManufacturer] = useQueryState<string | undefined>(
    'manufacturer',
    {defaultValue: undefined},
  );

  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const textInput = useRef<HTMLInputElement>(null);

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const {
    values: {sortOrder, orderByField},
    updateValues,
  } = useSearchValues<OrderByParams<ArticleOrderField>>();

  const query = useMemo(
    () =>
      createSearchQuery({
        search,
        storageLocation,
        category,
        manufacturer,
      }),
    [search, storageLocation, category, manufacturer],
  );

  const filters: QueryArticleParams = {
    ...(query && {query}),
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    order: sortOrder || Order.DESC,
    orderByField: orderByField || ArticleOrderField.CREATED_DATE,
    type: selectedType.includes(ARTICLE_TYPE_FILTER.ALL)
      ? getArticleTypes({excludeTypes: [ArticleType.MIX]})
      : selectedType.length > 0
      ? (selectedType as unknown as ArticleType[])
      : getArticleTypes({excludeTypes: [ArticleType.MIX]}),

    ...(selectedUnit && {unit: [selectedUnit]}),
    ...(vat && {sellingVatPercent: vat}),

    ...(sellingPriceMin &&
      sellingPriceMin > 0 && {
        netSellingPriceStart: `${convertNumberToAmountNumber(
          sellingPriceMin,
          currentCurrency,
        )}`,
      }),
    ...(sellingPriceMax &&
      sellingPriceMax > 0 && {
        netSellingPriceEnd: `${convertNumberToAmountNumber(
          sellingPriceMax,
          currentCurrency,
        )}`,
      }),

    ...(buyingPriceMin &&
      buyingPriceMin > 0 && {
        netPurchasePriceStart: `${convertNumberToAmountNumber(
          buyingPriceMin,
          currentCurrency,
        )}`,
      }),
    ...(buyingPriceMax &&
      buyingPriceMax > 0 && {
        netPurchasePriceEnd: `${convertNumberToAmountNumber(
          buyingPriceMax,
          currentCurrency,
        )}`,
      }),
  };

  const {
    data: articleResource = createEmptyResource<ArticleView>(pageSize),
    isIdle,
    isLoading,
    isFetched,
  } = useArticles(filters, {keepPreviousData: true}, true);

  const {data: articleStatistics} = useArticleStatistics(filters, {
    keepPreviousData: true,
  });

  const {refetch: refetchAllArticles, isFetching: isFetchingAllArticles} =
    useAllArticles(filters, {
      enabled: false,
      refetchOnWindowFocus: false,
    });

  const {mutateAsync: updateArticle} = useUpdateArticle(
    t('Article updated successfully.'),
  );

  const handleUpdateTags = (articleId: string) => (tagIds: string[]) => {
    updateArticle({
      articleId,
      article: {
        tags: tagIds,
      },
    });
  };

  const handleUpdateArticleTags =
    (articleId: string) => (tags: TagRecord[]) => {
      handleUpdateTags(articleId)(tags.map((tag) => tag.id));
    };

  const navigateToNew = () => {
    navigate('new');
  };

  const COLUMNS = useMemo<TableColumnWithRender<ArticleTableRow>[]>(
    () => [
      {
        headerName: 'Number',
        key: 'article-cell-number',
        fieldName: ArticleOrderField.EXTERNAL_ID,
        width: '124px',
        isFirst: true, // remove when checkbox are present with bulk action
        showShadows: showRightShadow ? 'right' : undefined,
        getExportValue: (quotation) => quotation.number || '',
        renderCell: (quotation, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{quotation.number || '-'}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Name',
        key: 'article-cell-name',
        fieldName: ArticleOrderField.NAME,
        getExportValue: (article) => getPlainStringFromHtml(article.name) || '',
        renderCell: (article, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {getPlainStringFromHtml(article.name) || '-'}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Manufacturer',
        key: 'article-cell-manufacturer',
        width: '212px',
        fieldName: ArticleOrderField.MANUFACTURER,
        getExportValue: (article) => article.manufacturer || '',
        renderCell: (article, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{article.manufacturer || '-'}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Description',
        key: 'article-cell-description',
        width: '528px',
        fieldName: ArticleOrderField.DESCRIPTION,
        getExportValue: (article) =>
          article.description
            ? getPlainStringFromHtml(article.description)
            : '',
        renderCell: (article, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {article.description
                ? getPlainStringFromHtml(article.description)
                : '-'}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Tag',
        key: 'article-cell-tag',
        width: '212px',
        renderCell: (article, cellProps) => (
          <Cell {...cellProps}>
            <TagCell
              tags={article.tags || []}
              entity={TagEntityType.ARTICLE}
              onChange={handleUpdateArticleTags(article.id)}
            />
          </Cell>
        ),
      },
      {
        headerName: 'Category',
        key: 'article-cell-category',
        width: '132px',
        fieldName: ArticleOrderField.CATEGORY,
        getExportValue: (article) => article.category || '',
        renderCell: (article, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{article.category || '-'}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Type',
        key: 'article-cell-type',
        width: '186px',
        fieldName: ArticleOrderField.TYPE,
        getExportValue: (article) => article.type,
        renderCell: (article, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{t(stringToTitleCase(article.type))}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Unit',
        key: 'article-cell-unit',
        width: '186px',
        fieldName: ArticleOrderField.UNIT,
        getExportValue: (article) => article.unit || '',
        renderCell: (article, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {article.unit ? t(article.unit) : '-'}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Selling price',
        key: 'article-cell-selling-price',
        width: '142px',
        align: 'right',
        isLast: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        fieldName: ArticleOrderField.SELLING_NET_AMOUNT,
        getExportValue: (article) => article.price,
        renderCell: (article, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{article.price}</TableCellText>
          </Cell>
        ),
      },
    ],
    [showLeftShadow, showRightShadow],
  );

  // filter intermediate state
  const {handleSubmit, setValue, watch, control} = useForm<ArticleFilterForm>({
    defaultValues: {
      unit: selectedUnit,
      sellingPriceMin,
      sellingPriceMax,
      buyingPriceMin,
      buyingPriceMax,
    },
    mode: 'all',
  });

  const watchUnit = watch('unit');
  const watchSellingPriceMin = watch('sellingPriceMin');
  const watchSellingPriceMax = watch('sellingPriceMax');
  const watchBuyingPriceMin = watch('buyingPriceMin');
  const watchBuyingPriceMax = watch('buyingPriceMax');
  const watchVatPercentage = watch('vatPercentage');

  const rows = useMemo(
    () => aggregateArticleRow(articleResource.data),
    [articleResource],
  );

  const handleFilterApply: SubmitHandler<ArticleFilterForm> = (data) => {
    setSelectedUnit(data.unit);
    setSellingPriceMin(data.sellingPriceMin);
    setSellingPriceMax(data.sellingPriceMax);
    setBuyingPriceMin(data.buyingPriceMin);
    setBuyingPriceMax(data.buyingPriceMax);
    setVat(data.vatPercentage);
    setStorageLocation(data.storageLocation);
    setCategory(data.category);
    setManufacturer(data.manufacturer);
  };

  const handleFilterOpen = () => {
    setValue('unit', selectedUnit);
    setValue('sellingPriceMin', sellingPriceMin);
    setValue('sellingPriceMax', sellingPriceMax);
    setValue('buyingPriceMin', buyingPriceMin);
    setValue('buyingPriceMax', buyingPriceMax);
    setValue('vatPercentage', vat);
    setValue('storageLocation', storageLocation);
    setValue('category', category);
    setValue('manufacturer', manufacturer);
  };

  const handleFilterReset = () => {
    setSelectedUnit(undefined);
    setSellingPriceMin(undefined);
    setSellingPriceMax(undefined);
    setBuyingPriceMin(undefined);
    setBuyingPriceMax(undefined);
    setVat(undefined);
    setStorageLocation(undefined);
    setCategory(undefined);
    setManufacturer(undefined);
  };

  const appliedFilterNumber = useMemo(
    () =>
      [vat, selectedUnit, storageLocation, category, manufacturer].filter(
        (field) => !!field,
      ).length +
      [sellingPriceMin, sellingPriceMax, buyingPriceMin, buyingPriceMax].filter(
        (field) => !!field && field > 0,
      ).length,
    [
      selectedUnit,
      sellingPriceMin,
      sellingPriceMax,
      buyingPriceMin,
      buyingPriceMax,
      vat,
      storageLocation,
      category,
      manufacturer,
    ],
  );

  const {emptyTable, noMatchingData} = useMemo(() => {
    if (!isFetched) return {emptyTable: false, noMatchingData: false};

    if (
      (appliedFilterNumber > 0 || selectedType.length > 0 || !!search) &&
      articleResource.total === 0
    ) {
      return {emptyTable: false, noMatchingData: true};
    }

    // when the user does not have filters applied and there are no entries for the table
    if (articleResource.total === 0) {
      return {emptyTable: true, noMatchingData: false};
    }

    return {emptyTable: false, noMatchingData: false};
  }, [appliedFilterNumber, isFetched, articleResource]);

  const aggregatedQuotationStatistics = useMemo(() => {
    if (!articleStatistics) return undefined;

    return reduce(
      articleStatistics.numOfArticlesPerType,
      (acc: Record<string, number>, amount, currentStatus) => {
        acc[currentStatus] = (acc[currentStatus] ?? 0) + amount;
        acc[ARTICLE_TYPE_FILTER.ALL] =
          (acc[ARTICLE_TYPE_FILTER.ALL] ?? 0) + amount;
        return acc;
      },
      {},
    );
  }, [articleStatistics]);

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleRowClick = (id: string) => () => {
    navigate(`/articles/details/${id}`);
  };

  const handleSortField = (fieldName: string) => {
    const order = toggleOrder(
      orderByField === fieldName ? sortOrder : undefined,
    );
    updateValues({
      orderByField: order ? (fieldName as ArticleOrderField) : undefined,
      sortOrder: order,
    });
  };

  const handleQuickFilterChange = (value: string) => {
    // when selecting ALL values remove all other selections
    if (value === 'ALL') {
      setSelectedType(
        selectedType.length === 1 && selectedType[0] === ARTICLE_TYPE_FILTER.ALL
          ? []
          : [ARTICLE_TYPE_FILTER.ALL],
      );
      return;
    }

    const newValues = selectedType.some((option) => option === value)
      ? selectedType.filter((option) => option !== value)
      : [...selectedType, value];

    // remove the ALL status if any other status is selected
    if (newValues.length > 1 && newValues.includes('ALL')) {
      setSelectedType(
        newValues.filter(
          (selectedValues) => selectedValues !== 'ALL',
        ) as ARTICLE_TYPE_FILTER[],
      );
      return;
    }

    const areAllValuesSelectedIndividually = filterOutQuickFilterOptions({
      options: QUICK_FILTER_OPTIONS,
    }).every((option) =>
      newValues.some((selectedValue) => option.value === selectedValue),
    );

    setSelectedType(
      areAllValuesSelectedIndividually
        ? [ARTICLE_TYPE_FILTER.ALL]
        : (newValues as ARTICLE_TYPE_FILTER[]),
    );
  };

  const handleExport = useExportTableSheet<ArticleTableRow, ArticleView>({
    refetchCallback: refetchAllArticles,
    excludedFields: ['article-cell-tag'],
    columns: COLUMNS,
    aggregateCallback: aggregateArticleRow,
    fileName: 'Articles',
  });

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = search;
    }
  }, []);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (emptyTable) {
    return (
      <EmptyTable
        illustration="articles"
        label="No articles"
        subLabel="Add articles to manage resources and materials used in job operations, ensuring accurate tracking and billing."
        btnLabel="New Article"
        onClick={navigateToNew}
      />
    );
  }

  return (
    <Box
      gap={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        padding: '24px',
      }}>
      <PageHeaderContainer>
        <Box
          sx={{
            display: 'flex',
          }}
          gap={2}>
          <SearchInput
            refInput={textInput}
            defaultValue={search}
            onChange={(val: string) => {
              setPage({
                ...page,
                pageIndex: 0,
              });
              setSearch(val);
            }}
          />
          <Filters
            activeFilters={appliedFilterNumber}
            onOpen={handleFilterOpen}
            onSave={handleSubmit(handleFilterApply)}
            onReset={handleFilterReset}>
            <Box sx={{display: 'flex', flexDirection: 'column'}} gap={2}>
              <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
                <Typography variant="subtitle2">
                  {t('Selling price')}
                </Typography>

                <Box sx={{display: 'flex'}} gap={1}>
                  <Controller
                    control={control}
                    name="sellingPriceMin"
                    render={({field}) => (
                      <TextInput
                        value={
                          watchSellingPriceMin ? `${watchSellingPriceMin}` : ''
                        }
                        placeholder="Min"
                        size="small"
                        styles={{
                          '& .MuiInputBase-input': {
                            textAlign: 'end',
                          },
                        }}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="sellingPriceMax"
                    render={({field}) => (
                      <TextInput
                        value={
                          watchSellingPriceMax ? `${watchSellingPriceMax}` : ''
                        }
                        placeholder="Max"
                        size="small"
                        styles={{
                          '& .MuiInputBase-input': {
                            textAlign: 'end',
                          },
                        }}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Box>
              </Box>

              <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
                <Typography variant="subtitle2">{t('Buying price')}</Typography>

                <Box sx={{display: 'flex'}} gap={1}>
                  <Controller
                    control={control}
                    name="buyingPriceMin"
                    render={({field}) => (
                      <TextInput
                        value={
                          watchBuyingPriceMin ? `${watchBuyingPriceMin}` : ''
                        }
                        placeholder="Min"
                        size="small"
                        styles={{
                          '& .MuiInputBase-input': {
                            textAlign: 'end',
                          },
                        }}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="buyingPriceMax"
                    render={({field}) => (
                      <TextInput
                        value={
                          watchBuyingPriceMax ? `${watchBuyingPriceMax}` : ''
                        }
                        placeholder="Max"
                        size="small"
                        styles={{
                          '& .MuiInputBase-input': {
                            textAlign: 'end',
                          },
                        }}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Box>
              </Box>

              <Box
                sx={{display: 'flex', flexDirection: 'column', width: '50%'}}
                gap={1}>
                <Typography variant="subtitle2">{t('VAT')}</Typography>

                <Controller
                  control={control}
                  name="vatPercentage"
                  render={({field}) => (
                    <TextInput
                      value={watchVatPercentage ? `${watchVatPercentage}` : ''}
                      placeholder="%"
                      size="small"
                      styles={{
                        '& .MuiInputBase-input': {
                          textAlign: 'end',
                        },
                      }}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Box>

              <Controller
                control={control}
                name="unit"
                render={({field}) => (
                  <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <Typography variant="subtitle2">{t('Unit')}</Typography>
                    <FormSelect
                      labelId="select-article-unit"
                      label=""
                      options={createMeasurementOptions(
                        selectedLng,
                        MeasurementUnit.UE,
                      )}
                      resetOption={{label: t('Select Unit')}}
                      selectProps={{
                        id: 'article-filter-select-unit',
                        value: watchUnit,
                        onChange: field.onChange,
                        placeholder: t('Select Unit'),
                      }}
                    />
                  </Box>
                )}
              />

              <Controller
                control={control}
                name="storageLocation"
                render={({field: {value, onChange}}) => (
                  <TextInput
                    value={value}
                    onChange={onChange}
                    size="small"
                    labelKey="Storage location"
                  />
                )}
              />

              <Controller
                control={control}
                name="category"
                render={({field: {value, onChange}}) => (
                  <TextInput
                    value={value}
                    onChange={onChange}
                    size="small"
                    labelKey="Category"
                  />
                )}
              />

              <Controller
                control={control}
                name="manufacturer"
                render={({field: {value, onChange}}) => (
                  <TextInput
                    value={value}
                    onChange={onChange}
                    size="small"
                    labelKey="Manufacturer"
                  />
                )}
              />
            </Box>
          </Filters>
        </Box>
        <Box display="flex" gap={2}>
          {rows.length > 0 && (
            <Button
              buttonProps={{
                size: 'medium',
                variant: 'outlined',
                color: 'primary',
                onClick: handleExport,
                disabled: isFetchingAllArticles,
              }}
              style={{
                borderColor: 'text.primary',
                height: '36px',
                paddingTop: 0,
              }}>
              {isFetchingAllArticles ? (
                <CircularProgress size="1rem" sx={{mr: 1}} />
              ) : null}
              <Box pt={0.5}>{t('Export')}</Box>
            </Button>
          )}
          <AddButton label="New Article" onClick={navigateToNew} />
        </Box>
      </PageHeaderContainer>
      <Box>
        <QuickFilter
          selected={selectedType ?? null}
          options={QUICK_FILTER_OPTIONS}
          statistics={aggregatedQuotationStatistics}
          onChange={handleQuickFilterChange}
        />
      </Box>
      <TableContainer
        showNoMatchWarning={noMatchingData}
        containerRef={containerRef}
        setShowLeftShadow={setShowLeftShadow}
        setShowRightShadow={setShowRightShadow}>
        <TableHeader
          columns={COLUMNS}
          sortState={{columnName: orderByField, order: sortOrder}}
          onSort={handleSortField}
        />
        <TableBody>
          {/* Row */}
          {rows.map((entry, index) => (
            <TableRow
              rowIndex={index}
              key={`article-row-${entry.id}`}
              testId={`article-row-${entry.id}`}>
              {COLUMNS.map(({renderCell, ...rest}) =>
                renderCell(entry, {
                  onClick:
                    renderCell.name !== 'TAG'
                      ? handleRowClick(entry.id)
                      : undefined,
                  ...rest,
                }),
              )}
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
      <Pagination
        currentIndex={articleResource.page.pageIndex}
        numberOfElementsPerPage={articleResource.page.pageSize}
        totalEntries={articleResource.total}
        onChange={handlePageIndexChange}
        onNumberPerPageChange={handleChangeElementsPerPage}
      />
    </Box>
  );
};

export default ArticleList;
