export interface HeaderTab {
  label: string;
  path: string;
}

interface TabsTranslator {
  (key: string): string;
}

export function getHeaderTabs(
  currentPath: string,
  t: TabsTranslator
): HeaderTab[] | undefined {
  if (currentPath.startsWith('/library')) {
    return [
      { label: t('library:tabs.workouts'), path: '/library/workouts' },
      { label: t('library:tabs.complex'), path: '/library/complex' },
      { label: t('library:tabs.exercises'), path: '/library/exercises' },
    ];
  }

  if (currentPath.startsWith('/admin')) {
    return [
      { label: 'Utilisateurs', path: '/admin/users' },
      { label: 'Clubs', path: '/admin/clubs' },
    ];
  }

  return undefined;
}
