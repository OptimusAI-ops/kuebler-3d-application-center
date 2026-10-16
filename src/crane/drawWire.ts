import { boomPointToWorld, CRANE, innerSectionX } from './kinematics.ts'
import type { CraneMotion, Point3 } from './kinematics.ts'
export type CraneSensor='inclinometer'|'draw-wire'
/** Illustrative constant-radius single-layer drum. Not manufacturer internals. */
export const DRAW_WIRE={exitOffset:[.075,.045,0] as Point3,drumRadius:.045,capacity:10,wireDiameter:.0009,windingPitch:.00095} as const
export const cableExitLocal=():Point3=>CRANE.drawWireHousing.map((v,i)=>v+DRAW_WIRE.exitOffset[i]) as Point3
export function cableAnchorLocal(state:CraneMotion):Point3{return [innerSectionX(state.boomExtensionMeters)+CRANE.drawWireAnchor[0],CRANE.drawWireAnchor[1],CRANE.drawWireAnchor[2]]}
const distance=(a:Point3,b:Point3)=>Math.hypot(...a.map((v,i)=>v-b[i]))
export function drawWireReadout(state:CraneMotion){
 const exit=boomPointToWorld(cableExitLocal(),state),anchor=boomPointToWorld(cableAnchorLocal(state),state)
 const referenceState={...state,boomExtensionMeters:0}
 const referencePayout=distance(boomPointToWorld(cableExitLocal(),referenceState),boomPointToWorld(cableAnchorLocal(referenceState),referenceState))
 const cablePayout=distance(exit,anchor),extension=Math.max(0,cablePayout-referencePayout)
 // Direct parallel routing makes dL/dt equal to stage extension speed; elevation cancels.
 const speed=state.extensionVelocity
 return {exit,anchor,cablePayout,referencePayout,extension,speed,percentage:Math.max(0,Math.min(100,extension/CRANE.maxExtension*100)),drumRadians:-cablePayout/DRAW_WIRE.drumRadius,remainingCable:DRAW_WIRE.capacity-cablePayout,movement:Math.abs(speed)<.0001?'Stationary':speed>0?'Extending':'Retracting'}
}
export const drawWireWorldPosition=(state:CraneMotion)=>boomPointToWorld([...CRANE.drawWireHousing],state)
