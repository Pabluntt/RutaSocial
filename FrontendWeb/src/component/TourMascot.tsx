import { useTourStore } from '../stores/useTourStore'
import { mascotAssets } from '../assets/mascot/mascotAssets'

export default function TourMascot() {
  const { steps, currentStep } = useTourStore()
  const step = steps[currentStep]
  if (!step) return null

  return (
    <div className="flex items-start gap-5 max-w-[85vw] sm:max-w-sm">
      <img
        src={mascotAssets[step.mascotPose]}
        alt="Mascota guía"
        className="flex-shrink-0 w-28 h-28 object-contain"
        style={{
          filter:
            'drop-shadow(0 0 1.5px rgba(0,0,0,0.35)) drop-shadow(0 4px 3px rgba(0,0,0,0.07)) drop-shadow(0 2px 2px rgba(0,0,0,0.06))',
        }}
      />
      <div className="relative bg-white rounded-xl px-5 py-4 shadow-xl mt-2">
        <div className="absolute left-[-7px] top-5 w-3.5 h-3.5 bg-white rotate-45" />
        <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-0.5">
          {step.title}
        </p>
        <p className="text-sm text-gray-700 leading-snug">
          {step.description}
        </p>
      </div>
    </div>
  )
}
