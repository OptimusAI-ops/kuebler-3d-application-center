import { ConveyorScene } from './ConveyorScene'
import type { MachineSceneProps } from './ConveyorScene'
import { CraneScene } from './CraneScene'
import { CarouselScene } from './CarouselScene'
import type { MachineId } from '../config/applications'
import type { ComponentType } from 'react'
export const sceneRegistry: Record<MachineId, ComponentType<MachineSceneProps>> = { conveyor: ConveyorScene, crane: CraneScene, carousel: CarouselScene }
