import { useMemo, useSyncExternalStore } from 'react'
import { CraneController } from './controller'
export function useCrane(){const controller=useMemo(()=>new CraneController(),[]);const snapshot=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);return {controller,snapshot}}
export type CraneBinding=ReturnType<typeof useCrane>
