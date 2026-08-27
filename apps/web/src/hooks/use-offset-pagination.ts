import { useCallback, useState } from 'react';

export function useOffsetPagination(initialLimit: number) {
  const [pageIndex, setPageIndex] = useState(0);
  const [limit, setLimitValue] = useState(initialLimit);
  const offset = pageIndex * limit;

  const reset = useCallback(() => setPageIndex(0), []);

  const setLimit = useCallback(
    (value: number) => {
      setLimitValue(value);
      reset();
    },
    [reset]
  );

  const previousPage = useCallback(() => {
    setPageIndex((page) => Math.max(0, page - 1));
  }, []);

  const nextPage = useCallback(() => {
    setPageIndex((page) => page + 1);
  }, []);

  return {
    limit,
    offset,
    reset,
    setLimit,
    previousPage,
    nextPage,
  };
}
