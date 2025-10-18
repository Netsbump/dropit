import { cn } from '@/lib/utils'
import { Dumbbell, Library, Zap } from 'lucide-react'
import type * as React from 'react'

const variantConfig = {
  workout: {
    gradient: 'from-orange-500 to-orange-600',
    bgColor: '#ed960b',
    icon: Dumbbell,
    iconColor: 'text-orange-50',
  },
  complex: {
    gradient: 'from-orange-500 to-orange-600',
    bgColor: '#ed960b',
    icon: Zap,
    iconColor: 'text-orange-50',
  },
  exercise: {
    gradient: 'from-orange-500 to-orange-600',
    bgColor: '#ed960b',
    icon: Library,
    iconColor: 'text-orange-50',
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
    <div
      className={cn(
        'relative overflow-hidden rounded-lg shadow-md mb-6',
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: config.bgColor }}
      />
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
          <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
          <p className="text-white/85 text-sm leading-relaxed">{description}</p>
        </div>

        {stat && (
          <div className="flex-shrink-0 text-right">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-white/75 text-xs uppercase tracking-wide font-medium">
              {stat.label}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
