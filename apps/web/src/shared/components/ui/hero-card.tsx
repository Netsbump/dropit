import { cn } from '@/lib/utils'
import { Dumbbell, Library, Zap } from 'lucide-react'

const variantConfig = {
  workout: {
    icon: Dumbbell,
    iconColor: 'text-gray-700',
    gradientClass: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    image: null, // À définir plus tard
  },
  complex: {
    icon: Zap,
    iconColor: 'text-gray-700',
    gradientClass: 'bg-gradient-to-br from-purple-50 to-pink-50',
    image: '/src/assets/images/hero-pages/199307.svg',
  },
  exercise: {
    icon: Library,
    iconColor: 'text-gray-700',
    gradientClass: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    image: null, // À définir plus tard
  },
}

export interface HeroCardProps {
  variant: 'workout' | 'complex' | 'exercise'
  title: string
  description: string
  stat?: {
    label: string
    value: number | string
  }
  className?: string
}

export function HeroCard({
  variant,
  title,
  description,
  stat,
  className,
}: HeroCardProps) {
  const config = variantConfig[variant]

  return (
    <div className="flex gap-6 mb-6">
      {/* Carte principale avec titre, description et image - 2/3 */}
      <div
        className={cn(
          'relative overflow-visible rounded-2xl shadow-sm flex-[2]',
          'bg-white/80 backdrop-blur-sm border border-gray-200',
          'h-52',
          className
        )}
      >
        <div className="relative z-10 p-8 h-full flex items-center">
          <div className="flex-1 min-w-0 pr-40">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          </div>

          {/* Image qui déborde en miroir */}
          {config.image && (
            <div className="absolute -right-4 -bottom-6 w-64 h-64 pointer-events-none">
              <img
                src={config.image}
                alt=""
                className="w-full h-full object-contain drop-shadow-lg scale-x-[-1]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Carte séparée pour les statistiques - 1/3 */}
      {stat && (
        <div className="relative overflow-hidden rounded-2xl shadow-sm flex-[1] flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100">
          <div className="text-5xl font-bold text-gray-800 mb-2">{stat.value}</div>
          <div className="text-gray-600 text-xs uppercase tracking-wide font-semibold text-center">
            {stat.label}
          </div>
        </div>
      )}
    </div>
  )
}
