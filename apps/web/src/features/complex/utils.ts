export const getCategoryBadgeVariant = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case 'épaulé':
    case 'epaule':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'arraché':
    case 'arrache':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'renforcement':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'force':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'technique':
      return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
    case 'accessoire':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};