import { createContext, use, useMemo, useState, type ReactNode } from 'react';

interface PageMeta {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  middleContent?: React.ReactNode;
}

interface PageMetaContextValue {
  pageMeta: PageMeta;
  setPageMeta: (meta: PageMeta) => void;
}

const PageMetaContext = createContext<PageMetaContextValue | undefined>(
  undefined
);

export function PageMetaProvider({ children }: { children: ReactNode }) {
  const [pageMeta, setPageMeta] = useState<PageMeta>({});
  const value = useMemo(() => ({ pageMeta, setPageMeta }), [pageMeta]);

  return (
    <PageMetaContext.Provider value={value}>
      {children}
    </PageMetaContext.Provider>
  );
}

export function usePageMeta(meta?: PageMeta) {
  const context = use(PageMetaContext);

  if (!context) {
    throw new Error('usePageMeta must be used within PageMetaProvider');
  }

  // Si des métadonnées sont fournies, les définir
  if (meta) {
    context.setPageMeta(meta);
  }

  return context;
}
