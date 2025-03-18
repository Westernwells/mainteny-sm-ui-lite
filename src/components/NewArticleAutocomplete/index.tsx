import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  TextField,
  Autocomplete,
  IconButton,
  Tooltip,
  Typography,
  Popper,
  PopperProps,
  TableHead,
  TableRow,
  Table,
  TextFieldProps,
} from '@mui/material';
import {t} from 'i18next';
import {centsToMoney, formatCurrency, useCurrentCurrency} from 'utils/currency';
import {createHighlightedText} from 'utils/utils';
import {createEmptyResource} from 'utils/paging';
import {
  ArticleType,
  ArticleView,
  COLUMN_DATA,
  CreateArticleRecord,
  UpdateArticleRecord,
} from 'models/article';
import {useArticles} from 'hooks/reactQuery/useArticle';
import {useCompanyNextNumber} from 'hooks/reactQuery/useCompanies';
import {ServiceCompanyNumberType} from 'models/service-company';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import {NoteAltOutlined} from '@mui/icons-material';
import NoteAlt from '@mui/icons-material/NoteAlt';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import {Currency, MultiVatsAmount} from 'models/misc';
import {removeHtmlTags} from 'utils/rich-field-string';
import {usePropertyOwnerQueryTravelWorks} from 'hooks/reactQuery/useTravelWork';
import {ServiceOrderType} from 'models/service-order';
import {PropertyOwnerView} from 'models/propertyManager';
import keyBy from 'lodash/keyBy';
import {getArticleTypes} from 'utils/article-utils';
import {
  headerCellStyle,
  footerTableStyle,
  footerCellStyle,
  iconButtonStyle,
  dismissButtonStyle,
  customPopperStyle,
} from './NewArticleAutoComplete.styles';

interface Props {
  setArticle?: (val: ArticleView | null) => void;
  setArticleQuery?: (val: string) => void;
  initialValue?: ArticleView | null;
  textFieldProps?: TextFieldProps;
  disabled?: boolean;
  onArticleSelect: (
    rowId: string,
    updatedBody: UpdateArticleRecord | CreateArticleRecord,
  ) => void;
  rowId: string;
  serviceCompanyId: string;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  openOnFocus?: boolean;
  propertyOwner?: PropertyOwnerView;
  excludeTypes?: ArticleType[];
  showCustomPriceColumn?: boolean;
}

interface ExtendedArticleView extends ArticleView {
  isCustom?: boolean;
  customSellingAmount?: MultiVatsAmount;
}
interface ArticleRowProps {
  option: ExtendedArticleView;
  queryView: string;
  currentCurrency: Currency;
  showCustomPriceColumn?: boolean;
}

export interface CustomPopperProps extends PopperProps {
  showCustomPriceColumn?: boolean;
}

const getIconByType = (type: ArticleType) => {
  switch (type) {
    case ArticleType.LABOR:
      return <TimerOutlinedIcon fontSize="small" sx={{color: '#828DA3'}} />;
    case ArticleType.MATERIAL:
      return <SettingsOutlinedIcon fontSize="small" sx={{color: '#828DA3'}} />;
    case ArticleType.MIX:
      return (
        <FolderOpenOutlinedIcon fontSize="small" sx={{color: '#828DA3'}} />
      );
    default:
      return <DashboardOutlinedIcon fontSize="small" sx={{color: '#828DA3'}} />;
  }
};

export const CustomPopper = ({
  children,
  anchorEl,
  open,
  showCustomPriceColumn,
}: CustomPopperProps): JSX.Element => {
  const [openUpwards, setOpenUpwards] = useState(false);
  const popperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchorEl) return;

    const popperPosition = popperRef.current?.getBoundingClientRect();

    if (popperPosition) {
      const spaceBelow = window.innerHeight - popperPosition.bottom;
      const spaceAbove = popperPosition.top;
      setOpenUpwards(spaceAbove > spaceBelow);
    }
  }, [anchorEl, open]);

  const resolvedAnchorEl = (() => {
    const el = typeof anchorEl === 'function' ? anchorEl() : anchorEl;
    return el instanceof HTMLElement ? el : null;
  })();

  const visibleColumns = showCustomPriceColumn
    ? COLUMN_DATA
    : COLUMN_DATA.filter((col) => col.title !== 'Custom Price (Net)');

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      ref={popperRef}
      sx={{
        ...customPopperStyle,
        left: resolvedAnchorEl ? `${resolvedAnchorEl.offsetLeft}px` : 0,
        top: resolvedAnchorEl
          ? openUpwards
            ? `${resolvedAnchorEl.offsetTop - 320}px`
            : `${resolvedAnchorEl.offsetTop + 40}px`
          : 0,
      }}
      placement={openUpwards ? 'top-start' : 'bottom-start'}>
      <div>
        <table style={{width: '100%', tableLayout: 'fixed'}}>
          <thead>
            <tr>
              {visibleColumns.map((col, index) => (
                <th
                  key={index}
                  style={{
                    ...headerCellStyle,
                    textAlign: col.alignment,
                    width: col.width,
                  }}>
                  <Typography variant="body2" color="text.secondary">
                    {t(col.title)}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
        </table>
        {typeof children === 'function'
          ? children({placement: 'auto'})
          : children}
        <Table style={footerTableStyle}>
          <TableHead>
            <TableRow style={{display: 'flex'}}>
              <TableHead style={footerCellStyle}>
                <IconButton sx={iconButtonStyle}>
                  <ArrowDropDownIcon sx={{fontSize: '1rem'}} />
                </IconButton>
                <IconButton sx={iconButtonStyle}>
                  <ArrowDropUpIcon sx={{fontSize: '1rem'}} />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {t('Navigate')}
                </Typography>
              </TableHead>
              <TableHead style={footerCellStyle}>
                <IconButton sx={iconButtonStyle}>
                  <SubdirectoryArrowLeftIcon sx={{fontSize: '1rem'}} />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {t('Select')}
                </Typography>
              </TableHead>
              <TableHead style={footerCellStyle}>
                <IconButton sx={dismissButtonStyle}>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    fontWeight="600">
                    {t('esc')}
                  </Typography>
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {t('Dismiss')}
                </Typography>
              </TableHead>
            </TableRow>
          </TableHead>
        </Table>
      </div>
    </Popper>
  );
};

const TableRowComponent = ({
  option,
  queryView,
  currentCurrency,
  showCustomPriceColumn,
}: ArticleRowProps) => (
  <tr style={{width: '100%'}}>
    <td style={{width: '180px', textAlign: 'left', paddingRight: '1.5em'}}>
      <Typography>
        {createHighlightedText(removeHtmlTags(option.name || ''), queryView)}
      </Typography>
    </td>
    <td style={{width: '75px', textAlign: 'left'}}>
      <Typography>
        {createHighlightedText(option.externalId || '', queryView)}
      </Typography>
    </td>
    <td style={{width: '56px', textAlign: 'right'}}>
      <Typography>{option.stock?.currentStock}</Typography>
    </td>
    <td style={{width: '70px', textAlign: 'center'}}>
      {getIconByType(option.type)}
    </td>
    <td style={{width: '70px', textAlign: 'center'}}>
      <Tooltip title={option.description || ''} arrow placement="top">
        {option.description ? (
          <NoteAlt fontSize="small" />
        ) : (
          <NoteAltOutlined fontSize="small" />
        )}
      </Tooltip>
    </td>
    <td style={{width: '72px', textAlign: 'right'}}>
      {formatCurrency(
        centsToMoney(currentCurrency.code, option.unitSellingAmount?.netAmount),
      )}
    </td>
    {showCustomPriceColumn && (
      <td style={{width: '116px', textAlign: 'right'}}>
        {option.isCustom
          ? formatCurrency(
              centsToMoney(
                currentCurrency.code,
                option.customSellingAmount?.netAmount,
              ),
            )
          : '-'}
      </td>
    )}
  </tr>
);

export const NewArticleAutoComplete = ({
  setArticle,
  setArticleQuery = () => {},
  initialValue = null,
  onArticleSelect,
  rowId,
  serviceCompanyId,
  onBlur,
  openOnFocus = true,
  propertyOwner,
  excludeTypes,
  showCustomPriceColumn = false,
}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const [query, setQuery] = useState(
    removeHtmlTags(initialValue?.name || '') || '',
  );
  const [queryView, setQueryView] = useState(
    removeHtmlTags(initialValue?.name || ''),
  );
  const [selectedArticle, setSelectedArticle] = useState<ArticleView | null>(
    initialValue,
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const {data: companyNextNumber} = useCompanyNextNumber(
    {type: ServiceCompanyNumberType.ARTICLE},
    serviceCompanyId,
  );

  const {data: articlesResource = createEmptyResource<ArticleView>(10)} =
    useArticles(
      {
        pageIndex: 0,
        pageSize: 5,
        query,
        type: getArticleTypes({excludeTypes}),
      },
      {keepPreviousData: true},
      true,
    );

  const {data: customPrices = []} = usePropertyOwnerQueryTravelWorks(
    propertyOwner?.id || '',
    {serviceOrderType: ServiceOrderType.GENERAL},
    {enabled: showCustomPriceColumn && !!propertyOwner?.id},
  );

  const mergedArticles: ExtendedArticleView[] = showCustomPriceColumn
    ? (articlesResource.data ?? []).map((article) => {
        const customPricesMap = keyBy(customPrices, (item) => item.article.id);
        const customItem = customPricesMap[article.id];
        if (customItem?.article) {
          const customArticle = customItem.article;
          return {
            ...article,
            name: removeHtmlTags(customArticle.name || article.name || ''),
            description: removeHtmlTags(
              customArticle.description || article.description || '',
            ),
            customSellingAmount: customArticle.unitSellingAmount,
            isCustom: true,
          };
        }
        return {
          ...article,
          name: removeHtmlTags(article.name || ''),
          description: removeHtmlTags(article.description || ''),
          isCustom: false,
        };
      })
    : (articlesResource.data ?? []).map((article) => ({
        ...article,
        name: removeHtmlTags(article.name || ''),
        description: removeHtmlTags(article.description || ''),
        isCustom: false,
      }));

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (setArticle) {
      setArticle(selectedArticle);
    }
  }, [selectedArticle]);

  useEffect(() => {
    if (setArticleQuery) {
      setArticleQuery(queryView);
    }
  }, [queryView]);

  useEffect(() => {
    if (initialValue && initialValue.name) {
      const cleanName = removeHtmlTags(initialValue.name || '');
      setQueryView(cleanName);
      setQuery(cleanName);
    } else {
      setQuery('');
      setQueryView('');
    }
  }, [initialValue]);

  const onInputChange = (e: SyntheticEvent, newValue: string) => {
    setQueryView(newValue || '');
    setQuery(newValue || '');
  };

  const onArticleSelectHandler = (article: ArticleView | string | null) => {
    if (!article) return;

    const createOrUpdateArticleBody = (articleBody: ArticleView | string) => {
      const baseArticleData = {
        serviceCompanyId: serviceCompanyId || '',
        externalId: companyNextNumber?.value || '',
        unitPurchaseAmount: {
          currency:
            (articleBody as ArticleView).unitPurchaseAmount?.currency ||
            currentCurrency.code ||
            'EUR',
          netAmount:
            (articleBody as ArticleView).unitPurchaseAmount?.netAmount ?? 0,
          percentageVat:
            (articleBody as ArticleView).unitPurchaseAmount?.percentageVat ?? 0,
        },
        unitSellingAmount: {
          currency:
            (articleBody as ExtendedArticleView).customSellingAmount
              ?.currency ||
            (articleBody as ArticleView).unitSellingAmount?.currency ||
            currentCurrency.code ||
            'EUR',
          netAmount:
            (articleBody as ExtendedArticleView).customSellingAmount
              ?.netAmount ??
            (articleBody as ArticleView).unitSellingAmount?.netAmount ??
            0,
          percentageVat:
            (articleBody as ExtendedArticleView).customSellingAmount
              ?.percentageVat ??
            (articleBody as ArticleView).unitSellingAmount?.percentageVat ??
            0,
        },
        stock: {
          currentStock: 1,
          maxStock: 1,
          minOrderQuantity: 1,
          minStock: 1,
        },
        description: '',
        model: '',
        category: '',
        subCategory: '',
        manufacturer: '',
        unit: '',
        storageLocation: '',
        contractName: '',
      };

      if (typeof articleBody === 'string') {
        return {
          ...baseArticleData,
          name: articleBody,
          type: rowId.includes('mixed') ? ArticleType.MIX : ArticleType.LABOR,
        };
      }

      return {
        ...baseArticleData,
        name: articleBody.name || '',
        description: articleBody.description || '',
        model: articleBody.model || '',
        type: rowId.includes('mixed')
          ? ArticleType.MIX
          : articleBody.type || ArticleType.OTHER,
        category: articleBody.category || '',
        subCategory: articleBody.subCategory || '',
        manufacturer: articleBody.manufacturer || '',
        unit: articleBody.unit || '',
        storageLocation: articleBody.storageLocation || '',
        contractName: articleBody.additionalInfo?.contractName || '',
        stock: articleBody.stock || undefined,
        costPackage: articleBody.additionalInfo?.costPackage || undefined,
      };
    };

    const articleData = article
      ? createOrUpdateArticleBody(article)
      : createOrUpdateArticleBody(queryView);

    onArticleSelect(rowId, articleData);
    setSelectedArticle(article as ArticleView);
  };

  const MemoizedPopper = useCallback(
    (popperProps: PopperProps) => (
      <CustomPopper
        {...popperProps}
        showCustomPriceColumn={showCustomPriceColumn}
      />
    ),
    [showCustomPriceColumn],
  );

  return (
    <Autocomplete
      freeSolo
      size="small"
      id="article-combo-box"
      disableClearable
      disablePortal
      clearOnEscape
      openOnFocus={openOnFocus}
      sx={{
        width: '100%',
        '& .MuiAutocomplete-popper': {zIndex: 101},
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
          {
            borderRadius: '0px',
          },
      }}
      inputValue={queryView}
      options={mergedArticles}
      renderOption={(params, option) => (
        <li {...params} key={option.id}>
          <table style={{width: '100%', tableLayout: 'fixed'}}>
            <tbody>
              <TableRowComponent
                option={option}
                queryView={queryView}
                currentCurrency={currentCurrency}
                showCustomPriceColumn={showCustomPriceColumn}
              />
            </tbody>
          </table>
        </li>
      )}
      onInputChange={onInputChange}
      onChange={(_event, value) => onArticleSelectHandler(value)}
      renderInput={(params) => {
        const inputValue = params.inputProps.value || '';
        return (
          <TextField
            {...params}
            onBlur={onBlur}
            inputRef={inputRef}
            error={inputValue === ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: inputValue === '' ? 'red' : '#000034',
                },
                '&:hover fieldset': {
                  borderColor: inputValue === '' ? 'red' : '#000034',
                },
                '&.Mui-focused fieldset': {
                  borderColor: inputValue === '' ? 'red' : '#000034',
                },
              },
            }}
          />
        );
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : removeHtmlTags(option.name || '')
      }
      PopperComponent={MemoizedPopper}
    />
  );
};

export default NewArticleAutoComplete;
