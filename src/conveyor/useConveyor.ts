import { useMemo, useSyncExternalStore } from 'react'
import { ConveyorController } from './controller'
export function useConveyor() {
  const controller=useMemo(()=>new ConveyorController(),[])
  const snapshot=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot)
  return {controller,snapshot}
}
