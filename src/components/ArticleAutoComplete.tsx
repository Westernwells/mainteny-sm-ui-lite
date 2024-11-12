import {SyntheticEvent, useCallback, useEffect, useState} from 'react';
import {TextFieldProps} from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import * as _ from 'lodash';
import {createEmptyResource} from 'utils/paging';
import {ArticleView} from 'models/article';
import {useArticles} from 'hooks/reactQuery/useArticle';
import {Typography} from '@mui/material';
import {t} from 'i18next';
import {
  centsToMoney,
  getCurrencySymbol,
  useCurrentCurrency,
} from 'utils/currency';
import {createHighlightedText, removeHtmlTags} from 'utils/utils';
import {FormInput} from './form/FormInput';

interface Props {
  getArticle?: (val: ArticleView | null) => void;
  getQuery?: (val: string) => void;
  initialValue?: ArticleView | null;
  textFieldProps?: TextFieldProps;
  disabled?: boolean;
}

export const ArticleAutocomplete = ({
  getArticle,
  getQuery = () => {},
  initialValue = null,
  textFieldProps,
  disabled,
}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const [query, setQuery] = useState<string>(
    initialValue ? `${initialValue.externalId} ${initialValue.name}` : '',
  );
  const [queryView, setQueryView] = useState(
    initialValue ? initialValue.name : '',
  );
  const [selectedArticle, setSelectedArticle] = useState<ArticleView | null>(
    initialValue,
  );

  const {data: articlesResource = createEmptyResource<ArticleView>(10)} =
    useArticles(
      {
        pageIndex: 0,
        pageSize: 3,
        query: encodeURIComponent(query),
      },
      {keepPreviousData: true},
      true,
    );

  const debouncedChangeHandler = useCallback(
    _.debounce((newValue: string) => {
      setQuery(newValue);
    }, 300),
    [],
  );

  const onInputChange = (
    e: SyntheticEvent,
    newValue: string,
    reason: string,
  ) => {
    setQueryView(newValue);
    debouncedChangeHandler(newValue);
    if (reason === 'clear') {
      setQueryView('');
      setSelectedArticle(null);
    }
  };

  useEffect(() => {
    if (getArticle) {
      getArticle(selectedArticle);
    }
  }, [selectedArticle]);

  useEffect(() => {
    if (getQuery) {
      getQuery(queryView);
    }

    if (!queryView) {
      setSelectedArticle(null);
      if (getQuery) getQuery('');
    }
  }, [queryView]);

  return (
    <Autocomplete
      noOptionsText={t('No options')}
      size="small"
      disabled={disabled}
      clearOnBlur={false}
      disablePortal
      id="article-combo-box"
      sx={{minHeight: 0}}
      options={[
        {name: 'autocomplete-table-title'} as ArticleView, // first option will be as table header
        ...(articlesResource.data?.map((article) => ({
          ...article,
          name: removeHtmlTags(article.name),
          description: removeHtmlTags(article.description),
        })) as ArticleView[]),
      ]}
      onChange={(event: any, newValue: ArticleView | null) => {
        setSelectedArticle(newValue);
      }}
      filterOptions={(options) => options}
      getOptionLabel={(option) => option.name}
      onInputChange={onInputChange}
      inputValue={queryView}
      renderInput={(params) => (
        <FormInput
          fieldProps={{
            name: 'articleId',
            ...params,
            ...textFieldProps,
            required: true,
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...(option.name !== 'autocomplete-table-title' ? props : {})}>
          <table style={{width: '100%'}}>
            {option.name === 'autocomplete-table-title' ? (
              <thead>
                <tr>
                  <th
                    style={{
                      width: '30%',
                      paddingLeft: '1rem',
                      textAlign: 'left',
                    }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Name')}
                    </Typography>
                  </th>
                  <th style={{width: '20%'}}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Article #')}
                    </Typography>
                  </th>
                  <th style={{width: '20%'}}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Category')}
                    </Typography>
                  </th>
                  <th
                    style={{
                      width: '30%',
                      paddingRight: '1rem',
                      textAlign: 'right',
                    }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Selling Price (excl. VAT)')}
                    </Typography>
                  </th>
                </tr>
              </thead>
            ) : (
              <tbody>
                <tr>
                  <td
                    style={{
                      width: '30%',
                      whiteSpace: 'break-spaces',
                      wordBreak: 'break-word',
                      textAlign: 'left',
                    }}>
                    {createHighlightedText(
                      removeHtmlTags(option.name),
                      queryView,
                    )}
                  </td>
                  <td
                    style={{
                      width: '20%',
                      whiteSpace: 'break-spaces',
                      wordBreak: 'break-word',
                      textAlign: 'left',
                    }}>
                    {createHighlightedText(option.externalId, queryView)}
                  </td>
                  <td
                    style={{
                      width: '20%',
                      whiteSpace: 'break-spaces',
                      wordBreak: 'break-word',
                      textAlign: 'left',
                    }}>
                    {createHighlightedText(option.category, queryView)}
                  </td>
                  <td
                    style={{
                      width: '30%',
                      whiteSpace: 'break-spaces',
                      wordBreak: 'break-word',
                      textAlign: 'right',
                    }}>
                    {getCurrencySymbol[currentCurrency.code]}
                    {centsToMoney(
                      currentCurrency.code,
                      option.unitSellingAmount.netAmount ?? 0,
                    )}
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </li>
      )}
    />
  );
};
