import { create } from 'zustand'
import type { MascotPose } from '../assets/mascot/mascotAssets'

export interface TourStep {
  id: string
  title: string
  description: string
  selector: string
  mascotPose: MascotPose
}

interface TourState {
  isActive: boolean
  currentStep: number
  steps: TourStep[]
  startTour: () => void
  closeTour: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
}

const defaultSteps: TourStep[] = [
  {
    id: 'home',
    title: 'Calendario',
    description: 'Aquí puedes ver y agendar nuevas rutas sociales. Es tu pantalla principal.',
    selector: '[data-tour-id="home"]',
    mascotPose: 'waveTour',
  },
  {
    id: 'profile',
    title: 'Perfil',
    description: 'Tus datos personales, estadísticas de participación y configuración de cuenta.',
    selector: '[data-tour-id="profile"]',
    mascotPose: 'thumbsUp',
  },
  {
    id: 'history',
    title: 'Historial',
    description: 'Revisa todas tus rutas pasadas, sus puntos de ayuda y los mapas de calor de los últimos meses.',
    selector: '[data-tour-id="history"]',
    mascotPose: 'thinking',
  },
  {
    id: 'map',
    title: 'Mapa',
    description: 'Crea o únete a rutas directamente en el mapa. También puedes registrar alojamientos (solo administradores).',
    selector: '[data-tour-id="map"]',
    mascotPose: 'idea',
  },
  {
    id: 'send-notice',
    title: 'Enviar Aviso',
    description: 'Crea y envía notificaciones a todos los voluntarios.',
    selector: '[data-tour-id="send-notice"]',
    mascotPose: 'surprised',
  },
  {
    id: 'people-helped',
    title: 'Personas Ayudadas',
    description: 'Expedientes y perfiles de las personas que has ayudado, con antecedentes e información médica.',
    selector: '[data-tour-id="people-helped"]',
    mascotPose: 'heart',
  },
  {
    id: 'admin-users',
    title: 'Gestionar Usuarios',
    description: 'Administra usuarios: crea, edita y elimina cuentas de voluntarios y administradores.',
    selector: '[data-tour-id="admin-users"]',
    mascotPose: 'wink',
  },
  {
    id: 'admin-routes',
    title: 'Gestionar Rutas',
    description: 'Revisa los detalles de cada ruta y descarga informes con todos sus datos.',
    selector: '[data-tour-id="admin-routes"]',
    mascotPose: 'happy',
  },
  {
    id: 'logout',
    title: 'Cerrar Sesión',
    description: 'Cierra tu sesión de forma segura cuando termines de usar la plataforma.',
    selector: '[data-tour-id="logout"]',
    mascotPose: 'waveTour',
  },
]

export const useTourStore = create<TourState>((set, get) => ({
  isActive: false,
  currentStep: 0,
  steps: defaultSteps,
  startTour: () => {
    const visibleSteps = defaultSteps.filter((s) => {
      if (s.id === 'admin-users' || s.id === 'admin-routes') {
        return !!document.querySelector(s.selector)
      }
      return true
    })
    set({ isActive: true, currentStep: 0, steps: visibleSteps })
  },
  closeTour: () => set({ isActive: false, currentStep: 0 }),
  nextStep: () => {
    const { currentStep, steps } = get()
    if (currentStep < steps.length - 1) {
      set({ currentStep: currentStep + 1 })
    } else {
      set({ isActive: false, currentStep: 0 })
    }
  },
  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 })
    }
  },
  goToStep: (index: number) => set({ currentStep: index }),
}))
