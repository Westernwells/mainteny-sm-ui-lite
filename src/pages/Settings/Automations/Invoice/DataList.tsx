import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box,
  ClickAwayListener,
  LinearProgress,
  MenuItem,
  Paper,
  Popper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {
  hasMultipleParagraphs,
  returnFirstParagraph,
} from 'utils/rich-text-field';
import {
  TravelWorkCalculationType,
  TravelWorkCalculationTypeLabels,
  travelWorkCalculationTypeOptions,
  TravelWorkView,
} from 'models/service-company';
import {CrossButton} from 'components/CrossButton';
import {DoneButton} from 'components/DoneButton';
import DOMPurify from 'dompurify';
import RichTextField from 'components/RichTextField';
import {TabsBody} from 'components/TabsBody';
import {TabItems, Tabs} from 'components/Tab';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import {getPlainStringFromHtml, isPlainString} from 'utils/rich-field-string';
import {EmptySection} from 'components/EmptySection';
import {ArticleView} from 'models/article';
import {useDebounce} from 'hooks/useDebounce';
import {createEmptyResource} from 'utils/paging';
import {useArticles} from 'hooks/reactQuery/useArticle';
import {formatCurrency} from 'utils/currency';
import {createHighlightedText} from 'utils/utils';
import {stripHtmlTags} from 'models/text-block';
import TruncatedTooltip from 'components/TruncatedTooltip';
import {Dialog} from 'components/Dialog';
import {useNavigate} from 'react-router-dom';
import useTheme from '@mui/material/styles/useTheme';
import {Actions} from './Actions';
import {
  StyledDataListCell,
  StyledDataListHeading,
  StyledDataListRow,
  StyledSelect,
} from './style';

const menuProps = {
  PaperProps: {
    style: {
      maxHeight: 230,
    },
  },
};

enum TabValues {
  ARTICLES = 0,
}

interface TableRowProps {
  index: number;
  item: ArticleView;
  searchText: string;
  handleSelectItem: (row: ArticleView, index: number) => void;
}

const TableRowComponent = ({
  index,
  item,
  searchText,
  handleSelectItem,
}: TableRowProps) => {
  // detect html tags in string and remove them if needed
  const itemName = useMemo(
    () =>
      isPlainString(item.name) ? item.name : getPlainStringFromHtml(item.name),
    [item],
  );

  return (
    <TableRow
      key={item.id}
      sx={{width: '100%', cursor: 'pointer'}}
      onClick={() => {
        handleSelectItem(item, index);
      }}>
      <TableCell sx={{padding: '0.8em 0em !important', width: '30%'}}>
        <Typography variant="subtitle1">
          {createHighlightedText(itemName, searchText)}
        </Typography>
      </TableCell>
      <TableCell sx={{width: '25%'}}>
        <Typography variant="subtitle1">
          {createHighlightedText(item.externalId, searchText)}
        </Typography>
      </TableCell>
      <TableCell sx={{width: '15%'}}>
        <Typography variant="subtitle1">
          {createHighlightedText(item.category, searchText)}
        </Typography>
      </TableCell>
      <TableCell
        sx={{
          textAlign: 'right',
          padding: '2em 0em',
          width: '35%',
        }}>
        <Typography variant="subtitle1">
          {formatCurrency(
            (item?.unitSellingAmount?.netAmount ?? 0) /
              10 ** (item?.unitSellingAmount?.fractionDigits ?? 0),
            {
              currency: item?.unitSellingAmount?.currency,
            },
          )}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export interface FormState {
  id?: string;
  realId?: string;
  name: string;
  articleNumber: string;
  unit: string;
  automate: string;
  sellingPrice: number;
  calculationType?: TravelWorkCalculationType;
  article?: ArticleView;
}

type Props = {
  data: TravelWorkView[];
  mode?: 'view' | 'edit' | 'create';
  onCancel: () => void;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  loading?: boolean;
  onCreate?: () => Promise<void>;
  onEditStart: (event: TravelWorkView, index: number) => void;
  editingEvent: {
    event?: TravelWorkView;
    index?: number;
  };
  onDeleteStart?: (event: TravelWorkView, index: number) => void;
  isListingView: boolean;
};

const DataList = ({
  data,
  onCancel,
  form,
  setForm,
  onCreate,
  onEditStart,
  editingEvent,
  onDeleteStart,
  mode = 'view',
  loading = false,
  isListingView,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);
  const [isOpenDialog, setIsDialogOpen] = useState<boolean>(false);
  const [activeArticle, setActiveArticle] = useState<ArticleView>();

  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 100);
  const [tabValue, setTabValue] = useState(0);
  const [searchState, setSearchState] = useState({
    popperOpen: false,
    searchText: '',
    showArticleSearch: false,
  });
  const articleAnchorEl = useRef<HTMLDivElement>(null);

  const tabItems: TabItems[] = useMemo(() => {
    const tItems = [
      {
        label: 'Articles & Spare parts',
        icon: <HomeRepairServiceIcon />,
      },
    ];
    return tItems;
  }, []);

  const scrollToBottom = () => {
    if (boxRef.current) {
      boxRef.current.scrollTo({
        top: boxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const isValid = !!form.name && !!form.calculationType;

  useEffect(() => {
    if (mode === 'create') {
      scrollToBottom();
    }
  }, [mode]);

  const handlePopperOpen = () => {
    setSearchState((prev) => ({
      ...prev,
      popperOpen: true,
      showArticleSearch: true,
    }));
  };

  const handlePopperClose = () => {
    setSearchState((prev) => ({
      ...prev,
      popperOpen: false,
      showArticleSearch: false,
    }));
  };

  const columns: {name: string; align?: TableCellProps['align']}[] = [
    {name: 'Name'},
    {name: 'Article #'},
    {name: 'Category'},
    {name: 'Selling Price (excl. VAT)', align: 'right'},
  ];

  const renderTable = (articleData: ArticleView[], isDataLoading: boolean) => {
    if (isDataLoading) {
      return (
        <LinearProgress sx={{position: 'absolute', width: '100%', bottom: 0}} />
      );
    }

    if (articleData.length <= 0) {
      return (
        <EmptySection
          label="We couldn't find any articles & spare parts."
          containerStyle={{height: '100%', my: '2em'}}
          illustration="articles"
          labelStyle={{
            fontSize: '1.2rem',
            fontWeight: 400,
            color: theme.palette.text.secondary,
          }}
        />
      );
    }

    return (
      <TableContainer
        sx={{
          overflowY: 'scroll',
          maxHeight: '290px',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.secondary.mainLight,
            borderRadius: '10px',
          },
        }}>
        <Table
          sx={{
            width: '100%',
            [`& .${tableCellClasses.root}`]: {
              p: 0,
              px: 0.5,
              borderBottom: 'none',
              borderSpacing: '0 1rem',
            },
            [`& .${tableCellClasses.head}`]: {
              p: 0,
              px: 0.5,
              color: 'text.secondary',
              typography: 'caption',
            },
            [`& .${tableCellClasses.body}`]: {
              p: 0,
              px: 0.5,
            },
            '& .MuiOutlinedInput-root': {
              fieldset: {
                borderColor: theme.palette.grey[200],
              },
            },
          }}
          aria-label="articles table">
          <TableHead
            sx={{
              position: 'sticky',
              top: 0,
              background: theme.palette.warning.contrastText,
            }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.name}
                  align={column.align || 'left'}
                  sx={{padding: '0.5em 0em!important'}}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.8rem"
                    py={1}>
                    {t(column.name)}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {articleData?.map((item, index) => (
              <TableRowComponent
                index={index}
                item={item}
                searchText={searchText}
                key={item.id}
                handleSelectItem={() => {
                  setForm((prevForm) => ({
                    ...prevForm,
                    article: item,
                    unit: item.unit,
                    name: item.name,
                    articleNumber: item.externalId,
                    sellingPrice:
                      (item?.unitSellingAmount?.netAmount ?? 0) /
                      10 ** (item?.unitSellingAmount?.fractionDigits ?? 0),
                  }));
                  handlePopperClose();
                }}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const {
    data: articleResource = createEmptyResource<ArticleView>(30),
    isLoading: isArticleLoading,
  } = useArticles(
    {
      pageIndex: 0,
      pageSize: 30,
      query: debouncedSearchText,
    },
    {keepPreviousData: true, enabled: searchState.popperOpen && tabValue === 0},
  );

  const handleTextFieldChange = () => (value: string) => {
    setForm((prevData) => ({...prevData, name: value}));
    const plainText = getPlainStringFromHtml(value);
    if (isPlainString(plainText)) setSearchText(plainText);
  };

  const renderTableHeader = () => (
    <Box display="flex" flexDirection="row" sx={{position: 'relative'}}>
      <StyledDataListHeading flex="0 0 20%">
        <Typography variant="h6">{t('Name')}</Typography>
      </StyledDataListHeading>

      <StyledDataListHeading flex="0 0 15%" paddingLeft="1em">
        <Typography variant="h6">{t('Article')} #</Typography>
      </StyledDataListHeading>

      <StyledDataListHeading flex="0 0 10%">
        <Typography variant="h6">{t('Unit')}</Typography>
      </StyledDataListHeading>

      <StyledDataListHeading flex="0 0 25%" paddingLeft="1em">
        <Typography variant="h6">{t('Automate')}</Typography>
      </StyledDataListHeading>

      <StyledDataListHeading
        flex="0 0 30%"
        paddingLeft="1.5em"
        sx={{
          alignItems: 'center',
          flexDirection: 'row',
          display: 'flex',
        }}>
        <Typography variant="h6">{t('Selling Price (Excl. VAT)')}</Typography>
      </StyledDataListHeading>
    </Box>
  );

  if (loading) {
    return (
      <LinearProgress sx={{position: 'absolute', width: '100%', bottom: 0}} />
    );
  }

  return (
    <Box>
      {renderTableHeader()}

      <Box
        ref={boxRef}
        sx={{overflowY: 'auto', maxHeight: '45vh', position: 'relative'}}>
        <>
          {data?.map((item, index) => {
            const valueToShow = hasMultipleParagraphs(item?.article.name)
              ? returnFirstParagraph(item?.article.name)
              : item?.article.name;

            const articleDescription = item.article?.description;

            const isEditing = mode === 'edit' && index === editingEvent.index;

            return (
              <StyledDataListRow
                key={`${item.id}-${index}`}
                sx={{
                  backgroundColor:
                    isEditing && !isListingView ? '#222B451F' : '#FFFFFF',
                  transition: 'background-color 0.3s ease',
                }}>
                <StyledDataListCell flex="0 0 20%">
                  {articleDescription ? (
                    <TruncatedTooltip
                      textContent={articleDescription}
                      valueToShow={valueToShow}
                      onButtonClick={() => {
                        setActiveArticle(item.article);
                        setIsDialogOpen(true);
                      }}
                    />
                  ) : (
                    <Typography
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(valueToShow),
                      }}
                    />
                  )}
                </StyledDataListCell>

                <StyledDataListCell flex="0 0 15%">
                  <Typography
                    color="primary.main"
                    variant="body2"
                    sx={{fontWeight: isEditing ? 'bold' : 'normal'}}>
                    {item?.article?.externalId || '-'}
                  </Typography>
                </StyledDataListCell>

                <StyledDataListCell flex="0 0 10%">
                  <Typography
                    color="primary.main"
                    variant="body2"
                    sx={{fontWeight: isEditing ? 'bold' : 'normal'}}>
                    {t(item?.article?.unit) || '-'}
                  </Typography>
                </StyledDataListCell>

                <StyledDataListCell flex="0 0 25%">
                  <Box flex={1}>
                    {isEditing && !isListingView ? (
                      <StyledSelect
                        mode={mode}
                        value={form.calculationType ?? ''}
                        onChange={(e) => {
                          const value = e.target
                            .value as TravelWorkCalculationType;
                          setForm((prevForm) => ({
                            ...prevForm,
                            calculationType: value,
                          }));
                        }}
                        MenuProps={menuProps}
                        displayEmpty>
                        <MenuItem value="" disabled>
                          {t('Auto type')}
                        </MenuItem>
                        {travelWorkCalculationTypeOptions.map(
                          (calculationTypeOptions) => (
                            <MenuItem
                              key={calculationTypeOptions.value}
                              value={calculationTypeOptions.value}>
                              {t(calculationTypeOptions.label)}
                            </MenuItem>
                          ),
                        )}
                      </StyledSelect>
                    ) : (
                      <Typography color="primary.main" variant="body2">
                        {t(
                          TravelWorkCalculationTypeLabels[
                            item?.calculationType
                          ],
                        ) ?? ''}
                      </Typography>
                    )}
                  </Box>
                </StyledDataListCell>

                <StyledDataListCell
                  flex={isEditing && !isListingView ? '0 0 20%' : '0 0 30%'}
                  justifyContent={
                    !isListingView ? 'space-between' : 'flex-end'
                  }>
                  <Typography
                    color="primary.main"
                    variant="body2"
                    sx={{fontWeight: isEditing ? 'bold' : 'normal'}}>
                    {formatCurrency(
                      (item?.article?.unitSellingAmount?.netAmount ?? 0) /
                        10 **
                          (item?.article?.unitSellingAmount?.fractionDigits ??
                            0),
                      {
                        currency: item?.article?.unitSellingAmount.currency,
                      },
                    )}
                  </Typography>

                  {!isEditing && !isListingView && (
                    <Actions
                      eventType={item}
                      disabled={mode !== 'view'}
                      onEdit={() => {
                        onEditStart(item, index);
                      }}
                      onDelete={() => {
                        onDeleteStart?.(item, index);
                      }}
                    />
                  )}
                </StyledDataListCell>

                <StyledDataListCell
                  sx={{
                    flex: '0 0 10%',
                    justifyContent: 'space-around',
                  }}>
                  {isEditing && (
                    <>
                      <CrossButton onClick={onCancel} />
                      <DoneButton disabled={!isValid} onClick={onCreate} />
                    </>
                  )}
                </StyledDataListCell>
              </StyledDataListRow>
            );
          })}

          {mode === 'create' && !isListingView && (
            <>
              <StyledDataListRow
                sx={{
                  backgroundColor: '#222B451F',
                  transition: 'background-color 0.3s ease',
                }}>
                <StyledDataListCell flex="0 0 20%">
                  <ClickAwayListener onClickAway={handlePopperClose}>
                    <Box
                      ref={articleAnchorEl}
                      sx={{width: '100%', border: 'none'}}>
                      <RichTextField
                        html={form.name || ''}
                        updateHtml={handleTextFieldChange()}
                        minRows={0}
                        containerMinHeight={40}
                        onClick={handlePopperOpen}
                        fieldsetStyles={{border: 'none'}}
                        placeholder="Pick article"
                      />
                      <Box>
                        <Popper
                          open={searchState.showArticleSearch}
                          placement="bottom-start"
                          anchorEl={articleAnchorEl.current}
                          sx={{
                            zIndex: 1000000,
                          }}>
                          <Paper
                            sx={{
                              maxHeight: '380px',
                              pl: 2,
                              pr: 0.7,
                              py: 2,
                              boxShadow: '0px 4px 15px 0px #90909033',
                              width: '900px',
                            }}>
                            <div>
                              <Tabs
                                hideDivider
                                tabItems={tabItems}
                                currentIndex={tabValue}
                                onChange={(indexValue) =>
                                  setTabValue(indexValue)
                                }
                                isTextCap>
                                <TabsBody
                                  value={tabValue}
                                  index={TabValues.ARTICLES}>
                                  {renderTable(
                                    articleResource.data,
                                    isArticleLoading,
                                  )}
                                </TabsBody>
                              </Tabs>
                            </div>
                          </Paper>
                        </Popper>
                      </Box>
                    </Box>
                  </ClickAwayListener>
                </StyledDataListCell>

                <StyledDataListCell
                  sx={{flex: '0 0 15%', paddingLeft: '0.85em'}}>
                  <Typography color="primary.main" variant="body2">
                    {form.articleNumber}
                  </Typography>
                </StyledDataListCell>

                <StyledDataListCell
                  sx={{flex: '0 0 10%', paddingLeft: '0.85em'}}>
                  <Typography color="primary.main" variant="body2">
                    {form.unit}
                  </Typography>
                </StyledDataListCell>

                <StyledDataListCell flex="0 0 25%">
                  <StyledSelect
                    mode={mode}
                    value={form.calculationType ?? ''}
                    onChange={(e) => {
                      const value = e.target.value as TravelWorkCalculationType;
                      setForm((prevForm) => ({
                        ...prevForm,
                        calculationType: value,
                      }));
                    }}
                    MenuProps={menuProps}
                    displayEmpty>
                    <MenuItem value="" disabled>
                      {t('Auto type')}
                    </MenuItem>
                    {travelWorkCalculationTypeOptions.map(
                      (calculationTypeOptions) => (
                        <MenuItem
                          key={calculationTypeOptions.value}
                          value={calculationTypeOptions.value}>
                          {t(calculationTypeOptions.label)}
                        </MenuItem>
                      ),
                    )}
                  </StyledSelect>
                </StyledDataListCell>

                <StyledDataListCell
                  flex="0 0 20%"
                  justifyContent="space-between">
                  <Typography color="primary.main" variant="body2">
                    {formatCurrency(form.sellingPrice)}
                  </Typography>
                </StyledDataListCell>

                <StyledDataListCell
                  sx={{
                    flex: '0 0 10%',
                    justifyContent: 'space-around',
                  }}>
                  <CrossButton onClick={onCancel} />
                  <DoneButton disabled={!isValid} onClick={onCreate} />
                </StyledDataListCell>
              </StyledDataListRow>

              {!stripHtmlTags(form.name) && (
                <Box
                  py={1}
                  pl={2}
                  sx={{
                    background: '#ffdfde',
                  }}>
                  <Typography color="#FF182F" variant="body2">
                    {t('Article cannot be empty')}
                  </Typography>
                </Box>
              )}

              {stripHtmlTags(form.name) && !form.calculationType && (
                <Box
                  py={1}
                  pl={2}
                  sx={{
                    background: '#ffdfde',
                  }}>
                  <Typography color="#FF182F" variant="body2">
                    {t('Select automation')}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </>
      </Box>

      <Dialog
        title={stripHtmlTags(activeArticle?.name || '')}
        onCancel={() => setIsDialogOpen(false)}
        onSave={() => {
          navigate(`/articles/details/${activeArticle?.id!}`);
        }}
        dialogProps={{
          maxWidth: 'sm',
          open: isOpenDialog || false,
        }}
        saveButtonText="Go to article"
        saveButtonContainerStyles={{
          justifyContent: 'space-between',
          display: 'flex',
          width: '100%',
        }}
        cancelButtonVariant="outlined"
        cancelButtonStyles={{border: '1px solid #000034', color: ' #000034'}}
        cancelButtonTextColor="text.primary">
        <Typography
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(activeArticle?.description || ''),
          }}
        />
      </Dialog>
    </Box>
  );
};

export default DataList;
