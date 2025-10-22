export const getCategoryBadgeVariant = (categoryName: string) => {

    const colorVariants = [
      'bg-tertiary text-tertiary-foreground hover:bg-tertiary rounded-sm shadow-none',
      'bg-primary/60 text-primary-foreground hover:bg-primary/30 rounded-sm shadow-none',
      'bg-secondary text-secondary-foreground hover:bg-secondary rounded-sm shadow-none',
    ];

     // Hash simple basé sur les caractères du nom
     let hash = 0;
     for (let i = 0; i < categoryName.length; i++) {
       hash = ((hash << 5) - hash + categoryName.charCodeAt(i)) & 0xffffffff;
     }

     return colorVariants[Math.abs(hash) % colorVariants.length];
  };

export const getLevelBadgeVariant = (level: string) => {
  const levelLower = level.toLowerCase();

  // Mapping des niveaux vers les couleurs
  const levelColors: Record<string, string> = {
    'rookie': 'bg-gray-300 text-gray-800 hover:bg-gray-300 rounded-sm shadow-none',
    'regional': 'bg-secondary text-secondary-foreground hover:bg-secondary rounded-sm shadow-none',
    'elite': 'bg-tertiary text-tertiary-foreground hover:bg-tertiary rounded-sm shadow-none',
    'international': 'bg-purple-100 text-primary hover:bg-purple-100 rounded-sm shadow-none',
  };

  return levelColors[levelLower] || 'bg-gray-300 text-gray-800 hover:bg-gray-300 rounded-sm shadow-none';
};