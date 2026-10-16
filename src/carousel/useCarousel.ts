import { useMemo, useSyncExternalStore } from 'react'
import { CarouselController } from './controller'
export function useCarousel(){const controller=useMemo(()=>new CarouselController(),[]);const snapshot=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);return {controller,snapshot}}
export type CarouselBinding=ReturnType<typeof useCarousel>
