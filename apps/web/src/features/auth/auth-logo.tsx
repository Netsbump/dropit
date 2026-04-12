import { BicepsFlexed } from 'lucide-react';

export function AuthLogo() {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <BicepsFlexed className="h-8 w-8 stroke-[2.5] text-purple-700" />
      <span className="text-xl font-bold text-purple-700">Dropit</span>
    </div>
  );
}
