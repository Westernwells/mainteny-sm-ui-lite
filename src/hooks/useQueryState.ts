import {useCallback} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import qs from 'query-string';

export const useQueryState = (
  query: string,
): [string, (value: string) => void] => {
  const location = useLocation();
  const navigate = useNavigate();

  const setQuery = useCallback(
    (value: string) => {
      const existingQueries = qs.parse(location.search);

      const queryString = qs.stringify(
        {...existingQueries, [query]: value},
        {skipNull: true},
      );

      navigate(`${location.pathname}?${queryString}`, {replace: true});
    },
    [navigate, location, query],
  );

  return [(qs.parse(location.search)?.[query] ?? '') as string, setQuery];
};
