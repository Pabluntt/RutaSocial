import { useTourStore } from '../stores/useTourStore'

export default function TourMascot() {
  const { steps, currentStep } = useTourStore()
  const step = steps[currentStep]
  if (!step) return null

  return (
    <div className="flex items-start gap-3 max-w-xs">
      <div className="flex-shrink-0 w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center shadow-lg text-2xl animate-bounce">
        🤖
      </div>
      <div className="relative bg-white rounded-xl px-4 py-3 shadow-xl">
        <div className="absolute left-[-7px] top-4 w-3.5 h-3.5 bg-white rotate-45" />
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
