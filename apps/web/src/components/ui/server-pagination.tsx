import { useTranslation } from '@dropit/i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

type PaginationMetadata = {
  limit: number;
  offset: number;
  total: number;
  hasNext: boolean;
};

type ServerPaginationProps = {
  pagination: PaginationMetadata;
  itemCount: number;
  isFetching?: boolean;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function ServerPagination({
  pagination,
  itemCount,
  isFetching = false,
  pageSizeOptions,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
}: ServerPaginationProps) {
  const { t } = useTranslation('common');
  const rangeStart = pagination.total === 0 ? 0 : pagination.offset + 1;
  const rangeEnd = pagination.offset + itemCount;
  const canChangePageSize = pageSizeOptions && onPageSizeChange;

  return (
    <div className="flex shrink-0 flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <div>
          {t('table.rows_range', {
            start: rangeStart,
            end: rangeEnd,
            total: pagination.total,
          })}
          {isFetching ? ` · ${t('common.loading')}` : null}
        </div>

        {canChangePageSize ? (
          <div className="flex items-center gap-2">
            <span>{t('table.rows_per_page')}</span>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <div className="flex items-center space-x-2 self-end sm:self-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousPage}
          disabled={pagination.offset === 0 || isFetching}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextPage}
          disabled={!pagination.hasNext || isFetching}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
