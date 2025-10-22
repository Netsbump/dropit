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