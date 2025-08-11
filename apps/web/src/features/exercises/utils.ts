export const getExerciseCategoryBadgeVariant = (categoryName: string, allCategories: Array<{name: string}>) => {

  const colorVariants = [
    'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'bg-green-100 text-green-800 hover:bg-green-200', 
    'bg-purple-100 text-purple-800 hover:bg-purple-200',
    'bg-orange-100 text-orange-800 hover:bg-orange-200',
    'bg-red-100 text-red-800 hover:bg-red-200',
    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    'bg-pink-100 text-pink-800 hover:bg-pink-200',
    'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
    'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
    'bg-violet-100 text-violet-800 hover:bg-violet-200',
    'bg-rose-100 text-rose-800 hover:bg-rose-200',
  ];

  // Find the index of the category in the sorted list
  const sortedCategories = [...allCategories].sort((a, b) => a.name.localeCompare(b.name));
  const categoryIndex = sortedCategories.findIndex(cat => cat.name === categoryName);
  
  // If the category is not found, use the default gray color
  if (categoryIndex === -1) {
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
  
  // Use the modulo to loop through the colors if there are more categories than colors
  return colorVariants[categoryIndex % colorVariants.length];
};