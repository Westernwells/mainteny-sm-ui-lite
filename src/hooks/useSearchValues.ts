import {useCallback, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import qs from 'query-string';
import {NullablePartial, AnyRecord} from 'models/common';
import pick from 'lodash/pick';

type UseSearchValuesResult<T> = {
  values: T;
  updateValues: (
    newValues?: NullablePartial<T> | null,
    resetPrev?: boolean,
  ) => void;
  clearValues: (exclusions?: string[]) => void;
};

/**
 * Hook for managing and updating query string parameters in the URL.
 *
 * Allows updating, clearing, and managing search parameters safely.
 *
 * @returns An object containing the current search values, a function to update values, and a function to clear values.
 */
export const useSearchValues = <T = AnyRecord>(): UseSearchValuesResult<T> => {
  const navigate = useNavigate();
  const location = useLocation();
  const {search} = location;

  const values: T = useMemo(() => qs.parse(search) as T, [search]);

  const updateValues = useCallback(
    (
      newValues?: NullablePartial<T> | null | undefined,
      resetPrev?: boolean,
    ) => {
      const updatedValues = resetPrev
        ? {...newValues}
        : {...values, ...newValues};
      const queryString = qs.stringify(updatedValues);

      navigate(`${location.pathname}?${queryString}`, {replace: true});
    },
    [navigate, values],
  );

  const clearValues = useCallback(
    (exclusions: string[] = ['tab']) => {
      const valuesToKeep = exclusions ? pick(values, exclusions) : {};
      const queryString = qs.stringify(valuesToKeep);

      navigate(`${location.pathname}?${queryString}`, {replace: true});
    },
    [navigate, values],
  );

  // TODO: Add a list of allowed search values to prevent unnecessary or malicious changes.
  // For example, we can use `values` prop as {...values} and unnecessary search values will be passed

  return {values, updateValues, clearValues};
};
