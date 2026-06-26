import { useEffect, useState } from 'react'
import { useTourStore } from '../stores/useTourStore'
import TourHighlight from './TourHighlight'
import TourMascot from './TourMascot'
import { useTheme, useMediaQuery } from '@mui/material'

export default function TourOverlay() {
  const { isActive, currentStep, steps, closeTour, nextStep, prevStep } = useTourStore()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  useEffect(() => {
    if (!isActive) return
    const step = steps[currentStep]
    if (!step) return

    const updateRect = () => {
      const el = document.querySelector(step.selector)
      if (el) {
        setTargetRect(el.getBoundingClientRect())
      } else {
        setTargetRect(null)
      }
    }

    updateRect()
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [isActive, currentStep, steps])

  if (!isActive) return null

  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  const visibleSteps = steps.filter((s) => {
    if (s.id === 'admin-users' || s.id === 'admin-routes') {
      return !!document.querySelector(s.selector)
    }
    return true
  })

  const currentVisibleIndex = visibleSteps.findIndex(
    (s) => s.id === steps[currentStep]?.id,
  )
  const totalVisible = visibleSteps.length

  let mascotTop: number | undefined
  let mascotLeft: number | undefined

  if (targetRect) {
    const viewW = window.innerWidth
    const isLeftSide = targetRect.left < viewW / 2

    mascotTop = targetRect.top - 10
    if (isLeftSide) {
      mascotLeft = targetRect.right + 20
    } else {
      mascotLeft = targetRect.left - 320
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.tourOverlay === 'true') {
      closeTour()
    }
  }

  return (
    <>
      <div
        data-tour-overlay="true"
        className="fixed inset-0 z-[99] cursor-pointer"
        onClick={handleOverlayClick}
      />

      <TourHighlight />

      {targetRect && mascotTop !== undefined && mascotLeft !== undefined && (
        <div
          className="fixed z-[101]"
          style={{ top: mascotTop, left: Math.max(16, mascotLeft) }}
        >
          <TourMascot />
        </div>
      )}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[101] flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-xl">
        {!isDesktop && (
          <p className="text-sm text-gray-500 mr-2">
            Abre el menú lateral tocando ☰ para explorar las secciones.
          </p>
        )}
        <button
          onClick={prevStep}
          disabled={isFirst}
          className="px-4 py-1.5 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ← Anterior
        </button>

        <span className="text-xs text-gray-400 min-w-[60px] text-center">
          {currentVisibleIndex + 1} / {totalVisible}
        </span>

        {isLast ? (
          <button
            onClick={closeTour}
            className="px-4 py-1.5 text-sm rounded-full bg-teal-500 text-white hover:bg-teal-600 transition"
          >
            Finalizar
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="px-4 py-1.5 text-sm rounded-full bg-teal-500 text-white hover:bg-teal-600 transition"
          >
            Siguiente →
          </button>
        )}

        <button
          onClick={closeTour}
          className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
        >
          Saltar
        </button>
      </div>
    </>
  )
}
