import { cn } from '@/lib/utils'
import { Dumbbell, Library, Zap } from 'lucide-react'
import type * as React from 'react'

const variantConfig = {
  workout: {
    gradient: 'from-slate-700 via-slate-600 to-blue-600',
    icon: Dumbbell,
    iconColor: 'text-blue-100',
  },
  complex: {
    gradient: 'from-slate-700 via-slate-600 to-blue-600',
    icon: Zap,
    iconColor: 'text-blue-100',
  },
  exercise: {
    gradient: 'from-slate-700 via-slate-600 to-blue-600',
    icon: Library,
    iconColor: 'text-blue-100',
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
        className={cn(
          'absolute inset-0 bg-gradient-to-r',
          config.gradient
        )}
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
