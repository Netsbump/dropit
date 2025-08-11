export const getCategoryBadgeVariant = (categoryName: string) => {

    const colorVariants = [
      'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 rounded-sm shadow-none',
      'bg-green-100 text-green-800 hover:bg-green-100 rounded-sm shadow-none', 
      'bg-red-100 text-red-800 hover:bg-red-100 rounded-sm shadow-none',
      'bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-sm shadow-none',
      'bg-orange-100 text-orange-800 hover:bg-orange-100 rounded-sm shadow-none',
      'bg-purple-100 text-purple-800 hover:bg-purple-100 rounded-sm shadow-none',
      'bg-indigo-100 text-indigo-800 hover:bg-indigo-100 rounded-sm shadow-none',
      'bg-pink-100 text-pink-800 hover:bg-pink-100 rounded-sm shadow-none',
      'bg-cyan-100 text-cyan-800 hover:bg-cyan-100 rounded-sm shadow-none',
      'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-sm shadow-none',
      'bg-violet-100 text-violet-800 hover:bg-violet-100 rounded-sm shadow-none',
      'bg-rose-100 text-rose-800 hover:bg-rose-100 rounded-sm shadow-none',
    ];
  
     // Hash simple basé sur les caractères du nom
     let hash = 0;
     for (let i = 0; i < categoryName.length; i++) {
       hash = ((hash << 5) - hash + categoryName.charCodeAt(i)) & 0xffffffff;
     }
     
     return colorVariants[Math.abs(hash) % colorVariants.length];
  };