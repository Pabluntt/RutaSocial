import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTourStore } from '../stores/useTourStore'
import TourHighlight from './TourHighlight'
import TourMascot from './TourMascot'
import { useTheme, useMediaQuery } from '@mui/material'

export default function TourOverlay() {
  const location = useLocation()
  const { isActive, currentStep, steps, closeTour, nextStep, prevStep } = useTourStore()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  useEffect(() => {
    if (location.pathname.includes('login')) return
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
  }, [isActive, currentStep, steps, location.pathname])

  if (location.pathname.includes('login')) return null

  if (!isActive) return null

  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  let mascotTop: number | undefined
  let mascotLeft: number | undefined

  if (targetRect) {
    const viewW = window.innerWidth
    const isLeftSide = targetRect.left < viewW / 2

    mascotTop = Math.max(24, targetRect.top - 10)
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
        className="fixed inset-0 z-[1400] cursor-pointer"
        onClick={handleOverlayClick}
      />

      <TourHighlight />

      {targetRect && mascotTop !== undefined && mascotLeft !== undefined && (
        <div
          className="fixed z-[1402]"
          style={{ top: mascotTop, left: Math.max(16, mascotLeft) }}
        >
          <TourMascot />
        </div>
      )}

      <div className={`fixed left-1/2 -translate-x-1/2 z-[1402] bg-white shadow-xl ${isDesktop ? 'bottom-8 flex items-center gap-4 rounded-full px-6 py-3' : 'bottom-4 flex w-[calc(100vw-24px)] max-w-sm flex-col gap-2 rounded-2xl px-4 py-3'}`}>
        {!isDesktop && (
          <p className="text-sm text-gray-500 text-center">
            Recorre las secciones del menú lateral.
          </p>
        )}

        <div className="flex w-full items-center justify-center gap-3">
          <button
            onClick={prevStep}
            disabled={isFirst}
            className="px-4 py-1.5 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ← Anterior
          </button>

          <span className="text-xs text-gray-400 min-w-[52px] text-center">
            {currentStep + 1} / {steps.length}
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
        </div>

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
