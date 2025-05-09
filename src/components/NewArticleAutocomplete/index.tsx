import {SyntheticEvent, useCallback, useEffect, useRef, useState} from 'react';
import {
  Autocomplete,
  IconButton,
  Popper,
  PopperProps,
  Table,
  TableHead,
  TableRow,
  TextField,
  TextFieldProps,
  Tooltip,
  Typography,
} from '@mui/material';
import {t} from 'i18next';
import {centsToMoney, formatCurrency, useCurrentCurrency} from 'utils/currency';
import {createHighlightedText} from 'utils/utils';
import {createEmptyResource} from 'utils/paging';
import {
  ArticleType,
  ArticleView,
  COLUMN_DATA,
  ExtendedArticleView,
} from 'models/article';
import {useArticles} from 'hooks/reactQuery/useArticle';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import {ReactComponent as PackageIcon} from 'assets/icons/PackageLightIcon.svg';
import {NoteAltOutlined} from '@mui/icons-material';
import NoteAlt from '@mui/icons-material/NoteAlt';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import {Currency} from 'models/misc';
import {removeHtmlTags} from 'utils/rich-field-string';
import {usePropertyOwnerQueryTravelWorks} from 'hooks/reactQuery/useTravelWork';
import {ServiceOrderType} from 'models/service-order';
import {PropertyOwnerView} from 'models/propertyManager';
import keyBy from 'lodash/keyBy';
import {createSearchQuery, getArticleTypes} from 'utils/article-utils';
import {InvoiceItemRecord} from 'models/invoice';
import {QuotationItemRecord} from 'models/quotation';
import {
  customPopperStyle,
  dismissButtonStyle,
  footerCellStyle,
  footerTableContentStyle,
  footerTableStyle,
  headerCellStyle,
  iconButtonStyle,
} from './NewArticleAutoComplete.styles';

interface ArticleRowProps {
  option: ExtendedArticleView;
  queryView: string;
  currentCurrency: Currency;
  showCustomPriceColumn?: boolean;
}

export interface CustomPopperProps extends PopperProps {
  showCustomPriceColumn?: boolean;
}

export const getIconByType = (type: ArticleType) => {
  switch (type) {
    case ArticleType.LABOR:
      return <TimerOutlinedIcon fontSize="small" sx={{color: '#828DA3'}} />;
    case ArticleType.MATERIAL:
      return <SettingsOutlinedIcon fontSize="small" sx={{color: '#828DA3'}} />;
    case ArticleType.MIX:
      return (
        <FolderOpenOutlinedIcon fontSize="small" sx={{color: '#828DA3'}} />
      );
    case ArticleType.PACKAGE:
      return <PackageIcon fontSize="1.1rem" color="#828DA3" />;
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
        maxHeight: '450px',
        overflow: 'hidden',
      }}
      placement={openUpwards ? 'top-start' : 'bottom-start'}>
      <div>
        <table style={{width: '100%', tableLayout: 'fixed'}}>
          <thead
            style={{
              height: 40,
            }}>
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
        <Table sx={footerTableStyle}>
          <TableHead>
            <TableRow sx={footerTableContentStyle}>
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

interface Props {
  initialValue?: InvoiceItemRecord | QuotationItemRecord | null;
  textFieldProps?: TextFieldProps;
  openOnFocus?: boolean;
  propertyOwner?: PropertyOwnerView;
  excludeTypes?: ArticleType[];
  showCustomPriceColumn?: boolean;
  onArticleSelect: (selectedArticle: ArticleView | string) => void;
}

export const NewArticleAutoComplete = ({
  initialValue = null,
  openOnFocus = true,
  propertyOwner,
  excludeTypes,
  showCustomPriceColumn = false,
  onArticleSelect,
}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const [query, setQuery] = useState(
    removeHtmlTags(initialValue?.name || '') || '',
  );
  const [queryView, setQueryView] = useState(
    removeHtmlTags(initialValue?.name || ''),
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const {data: articlesResource = createEmptyResource<ArticleView>(10)} =
    useArticles(
      {
        pageIndex: 0,
        pageSize: 25,
        query: createSearchQuery({search: query}),
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
            description: customArticle.description || article.description || '',
            customSellingAmount: customArticle.unitSellingAmount,
            isCustom: true,
          };
        }
        return {
          ...article,
          name: removeHtmlTags(article.name || ''),
          description: article.description || '',
          isCustom: false,
        };
      })
    : (articlesResource.data ?? []).map((article) => ({
        ...article,
        name: removeHtmlTags(article.name || ''),
        description: article.description || '',
        isCustom: false,
      }));

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  const handleBlur = () => {
    if (queryView.trim() !== '') {
      onArticleSelect(queryView);
    }
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
      filterOptions={(options) => options}
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
      onChange={(_event, value) => onArticleSelect(value)}
      renderInput={(params) => {
        const inputValue = params.inputProps.value || '';
        return (
          <TextField
            {...params}
            inputRef={inputRef}
            error={inputValue === ''}
            onBlur={handleBlur}
            onFocus={(e) => {
              e.target.setSelectionRange(0, 0);
            }}
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
