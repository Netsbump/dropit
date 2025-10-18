import { createContext, useContext, useState, type ReactNode } from 'react';

interface PageMeta {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

interface PageMetaContextValue {
  pageMeta: PageMeta;
  setPageMeta: (meta: PageMeta) => void;
}

const PageMetaContext = createContext<PageMetaContextValue | undefined>(undefined);

export function PageMetaProvider({ children }: { children: ReactNode }) {
  const [pageMeta, setPageMeta] = useState<PageMeta>({});

  return (
    <PageMetaContext.Provider value={{ pageMeta, setPageMeta }}>
      {children}
    </PageMetaContext.Provider>
  );
}

export function usePageMeta(meta?: PageMeta) {
  const context = useContext(PageMetaContext);

  if (!context) {
    throw new Error('usePageMeta must be used within PageMetaProvider');
  }

  // Si des métadonnées sont fournies, les définir
  if (meta) {
    context.setPageMeta(meta);
  }

  return context;
}

export function usePageTitle() {
  const { pageMeta } = usePageMeta();
  return pageMeta.title;
}
