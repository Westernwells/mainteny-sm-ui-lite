import {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import qs from 'query-string';
import {isJson} from 'utils/utils';

export const useQueryState = <T = string>(
  query: string,
  {
    defaultValue = '' as T,
    isDate = false,
    reset = false,
    parserOptions,
  }: {
    defaultValue?: T;
    isDate?: boolean;
    reset?: boolean;
    parserOptions?: qs.ParseOptions | undefined;
  } = {},
): [T, (value: T) => void, () => void] => {
  const {location} = window;
  const navigate = useNavigate();
  type CallbackFunction<X> = (arg: X) => void;
  const setQuery = useCallback<CallbackFunction<T>>(
    (value) => {
      if (reset) {
        const queryString = qs.stringify(
          {[query]: value},
          {
            skipNull: true,
            arrayFormat: 'bracket',
          },
        );

        navigate(`${location.pathname}?${queryString}`, {replace: true});
        return;
      }

      const existingQueries = qs.parse(location.search, {
        arrayFormat: 'bracket',
        ...parserOptions,
      });

      if (
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete existingQueries[query];
      } else if (value instanceof Date) {
        existingQueries[query] = value.toISOString();
      } else if (typeof value === 'object') {
        existingQueries[query] = JSON.stringify(value);
      } else {
        existingQueries[query] = value as string | (string | null)[] | null;
      }

      const queryString = qs.stringify(existingQueries, {
        skipNull: true,
        arrayFormat: 'bracket',
      });

      navigate(`${location.pathname}?${queryString}`, {replace: true});
    },
    [navigate, query],
  );

  const clearFilters = () => {
    const existingQueries = qs.parse(location.search, {
      arrayFormat: 'bracket',
      ...parserOptions,
    });
    if (existingQueries.tab) {
      navigate(`${location.pathname}?tab=${existingQueries.tab}`, {
        replace: true,
      });
      return;
    }
    navigate(`${location.pathname}`, {replace: true});
  };

  let parsedValue =
    qs.parse(location.search, {arrayFormat: 'bracket', ...parserOptions})?.[
      query
    ] ?? defaultValue;

  if (isDate && typeof parsedValue === 'string') {
    parsedValue = new Date(parsedValue) as T;
  } else if (typeof parsedValue === 'string' && isJson(parsedValue)) {
    parsedValue = JSON.parse(parsedValue) as T;
  }

  return [parsedValue as T, setQuery, clearFilters];
};
