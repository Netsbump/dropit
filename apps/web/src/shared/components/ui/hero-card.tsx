import { cn } from '@/lib/utils'
import { Dumbbell, Library, Zap } from 'lucide-react'

const variantConfig = {
  workout: {
    icon: Dumbbell,
    iconColor: 'text-gray-700',
    gradientClass: 'hero-card-gradient-blue',
  },
  complex: {
    icon: Zap,
    iconColor: 'text-gray-700',
    gradientClass: 'hero-card-gradient-purple',
  },
  exercise: {
    icon: Library,
    iconColor: 'text-gray-700',
    gradientClass: 'hero-card-gradient-teal',
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
  const Icon = config.icon

  return (
    <div className="flex gap-4 mb-6">
      {/* Carte principale avec titre et description */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg shadow-md flex-1',
          config.gradientClass,
          className
        )}
      >
        <div className="relative z-10 p-6 flex items-center gap-6">
          <div
            className={cn(
              'flex-shrink-0 w-14 h-14 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center',
              'border border-white/20'
            )}
          >
            <Icon className={cn('w-7 h-7', config.iconColor)} strokeWidth={2.5} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">{title}</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </div>

      {/* Carte séparée pour les statistiques */}
      {stat && (
        <div className="hero-stats-card relative overflow-hidden rounded-lg shadow-md px-6 py-4 flex flex-col items-center justify-center min-w-[120px]">
          <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
          <div className="text-gray-700 text-xs uppercase tracking-wide font-medium text-center">
            {stat.label}
          </div>
        </div>
      )}
    </div>
  )
}
