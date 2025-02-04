import {SyntheticEvent, useEffect, useRef, useState} from 'react';
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
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
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
import {Currency} from 'models/misc';
import {removeHtmlTags} from 'utils/rich-field-string';
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
  onBlur: () => void;
}

interface ArticleRowProps {
  option: ArticleView;
  queryView: string;
  currentCurrency: Currency;
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

const CustomPopper = ({children, anchorEl, open}: PopperProps) => {
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
              {COLUMN_DATA.map((col, index) => (
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
          ? children({
              placement: 'auto',
            })
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
        (option.unitSellingAmount?.netAmount ?? 0) /
          10 ** currentCurrency.fractionDigits,
        {currency: currentCurrency.code},
      )}
    </td>
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
        type: Object.values(ArticleType),
      },
      {keepPreviousData: true},
      true,
    );

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
          currency: currentCurrency.code || 'EUR',
          netAmount: 0,
          percentageVat: 0,
        },
        unitSellingAmount: {
          currency: currentCurrency.code || 'EUR',
          netAmount: 0,
          percentageVat: 0,
        },
        stock: {
          currentStock: 1,
          maxStock: 1,
          minOrderQuantity: 1,
          minStock: 1,
        },
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

  const articles = articlesResource.data || [];

  return (
    <Autocomplete
      freeSolo
      size="small"
      id="article-combo-box"
      disableClearable
      clearOnBlur
      disablePortal
      clearOnEscape
      openOnFocus
      blurOnSelect
      sx={{
        width: '100%',
        '& .MuiAutocomplete-popper': {zIndex: 101},
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
          {
            borderRadius: '0px',
          },
      }}
      inputValue={queryView}
      options={articles.map((article) => ({
        ...article,
        name: removeHtmlTags(article.name || ''),
        description: removeHtmlTags(article.description || ''),
      }))}
      renderOption={(params, option) => (
        <li {...params} key={option.id}>
          <table style={{width: '100%', tableLayout: 'fixed'}}>
            <tbody>
              <TableRowComponent
                option={option}
                queryView={queryView}
                currentCurrency={currentCurrency}
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
      isOptionEqualToValue={(option, value) =>
        option.externalId === value.externalId
      }
      getOptionLabel={(option) =>
        typeof option !== 'string' ? removeHtmlTags(option.name || '') : ''
      }
      PopperComponent={CustomPopper}
    />
  );
};

export default NewArticleAutoComplete;
