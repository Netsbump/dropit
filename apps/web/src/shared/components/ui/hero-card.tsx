import { cn } from '@/lib/utils'
import { Dumbbell, Library, Zap, Users, Play, type LucideIcon } from 'lucide-react'
import { Button } from './button'

const variantConfig = {
  workout: {
    icon: Dumbbell,
    iconColor: 'text-gray-700',
    gradientClass: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    image: '/src/assets/images/hero-pages/199309.svg',
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
    image: '/src/assets/images/hero-pages/199308.svg',
  },
  athlete: {
    icon: Users,
    iconColor: 'text-gray-700',
    gradientClass: 'bg-gradient-to-br from-green-50 to-emerald-50',
    image: '/src/assets/images/hero-pages/1993014.svg',
  },
}

export interface HeroCardProps {
  variant: 'workout' | 'complex' | 'exercise' | 'athlete'
  title: string
  description: string
  stat?: {
    label: string
    value: number | string
    description?: string
    icon?: LucideIcon
    callToAction?: {
      text: string
      onClick: () => void
    }
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

          {/* Image qui déborde */}
          {config.image && (
            <div className="absolute -right-4 -bottom-6 w-64 h-64 pointer-events-none">
              <img
                src={config.image}
                alt=""
                className={cn(
                  "w-full h-full object-contain drop-shadow-lg",
                  variant === 'complex' && "scale-x-[-1]"
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Carte séparée pour les statistiques - 1/3 */}
      {stat && (
        <div className="relative overflow-hidden rounded-2xl shadow-sm flex-[1] flex flex-col items-center justify-center bg-orange-50 border border-orange-100 p-6">
          {/* Valeur et icône */}
          <div className="flex items-center gap-3 mb-2">
            <div className="text-5xl font-bold text-gray-800">{stat.value}</div>
            {stat.icon && <stat.icon className="h-8 w-8 text-orange-600" />}
          </div>

          {/* Label principal */}
          <div className="text-gray-600 text-xs uppercase tracking-wide font-semibold text-center mb-3">
            {stat.label}
          </div>

          {/* Call to action optionnel */}
          {stat.callToAction && (
            <Button
              variant="secondary"
              size="sm"
              onClick={stat.callToAction.onClick}
              className="bg-white hover:bg-gray-50 text-gray-700 text-xs shadow-sm border border-gray-200 h-auto py-2 px-3 whitespace-normal text-center leading-tight flex items-center gap-2"
            >
              {stat.callToAction.text}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 flex-shrink-0">
                <Play className="h-3 w-3 text-white fill-white" />
              </div>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
