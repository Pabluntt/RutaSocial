import { useTourStore } from '../stores/useTourStore'

export default function TourHighlight() {
  const { isActive, steps, currentStep } = useTourStore()

  if (!isActive) return null

  const step = steps[currentStep]
  if (!step) return null

  const el = document.querySelector(step.selector)
  if (!el) return null

  const rect = el.getBoundingClientRect()

  return (
    <div
      className="fixed z-[1401] pointer-events-none"
      style={{
        left: rect.left - 4,
        top: rect.top - 4,
        width: rect.width + 8,
        height: rect.height + 8,
        outline: '9999px solid rgba(0,0,0,0.55)',
        borderRadius: 12,
        transition: 'all 0.35s ease',
      }}
    />
  )
}
