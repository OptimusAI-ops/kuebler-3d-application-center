import { CONVEYOR, conveyorReadout, quadrature, TAU, wrap } from './simulation.ts'
import type { ConveyorMotion } from './simulation.ts'
export type ConveyorSensor = 'wheel' | 'shaft' | 'motor'
export const FEEDBACK = { wheelCircumference: .3, gearboxRatio: 20, ppr: 1024 } as const
export const conveyorSensors = {
 wheel: { title:'Measuring wheel', label:'Belt', location:[-.65,1.217+.3/TAU,.35] as [number,number,number], target:[-.65,1.217+.3/TAU,.449] as [number,number,number], offset:[.16,.13,.34] as [number,number,number], benefit:'Measure what actually moves.', detail:'A spring-loaded wheel measures belt travel at the surface. Compare it with shaft feedback to expose drive-to-belt slip.', family:'MWE61 · double O-ring · KIS50', link:'https://www.kuebler.com/en/products/measurement/linear-measuring-systems/product-finder/product-details/MWE61' },
 shaft: { title:'Shaft encoder', label:'Shaft', location:[1.8,1.05,.961] as [number,number,number], target:[1.8,1.05,.96] as [number,number,number], offset:[.32,.15,.14] as [number,number,number], benefit:'Synchronize the process.', detail:'Direct roller feedback measures the drive shaft after the gearbox. A belt-speed estimate assumes no slip at the roller.', family:'Sendix KIS50 · optical', link:'https://www.kuebler.com/en/products/measurement/encoders/product-finder/product-details/KIS50' },
 motor: { title:'Motor encoder', label:'Motor', location:[1.8,1.0918,-1.275] as [number,number,number], target:[1.8,1.074,-1.275] as [number,number,number], offset:[.15,.13,-.36] as [number,number,number], benefit:'Close the drive feedback loop.', detail:'A magnetic ring turns with the rotor inside the motor. A fixed read head measures it without contact, before the gearbox.', family:'RIM2000 · integrated magnetic', link:'https://www.kuebler.com/en/products/measurement/encoders/product-finder/product-details/RIM2000' },
} as const
/** Additional encoder channels derive from the original, unchanged conveyor state.
 * Illustrative 20:1 ideal gearbox and 300 mm wheel circumference; no wheel slip. */
export function feedbackReadout(state:ConveyorMotion,sensor:ConveyorSensor){
 const base=conveyorReadout(state),turns=sensor==='wheel'?state.beltTravel/FEEDBACK.wheelCircumference:base.turns*(sensor==='motor'?FEEDBACK.gearboxRatio:1)
 const rpm=sensor==='wheel'?base.actualSpeed/FEEDBACK.wheelCircumference*60:state.rpm*(sensor==='motor'?FEEDBACK.gearboxRatio:1)
 const bits=quadrature(turns*FEEDBACK.ppr)
 return {turns,rpm,degrees:wrap(turns*360,360),frequency:Math.abs(rpm)/60*FEEDBACK.ppr,pulses:Math.floor(turns*FEEDBACK.ppr+1e-8),signals:{a:bits.a,aNot:1-bits.a,b:bits.b,bNot:1-bits.b},travel:sensor==='wheel'?state.beltTravel:base.inferredTravel,speed:sensor==='wheel'?base.actualSpeed:base.shaftSpeed,actualSpeed:base.actualSpeed,shaftSpeed:base.shaftSpeed,direction:base.direction,slip:Math.abs(base.shaftSpeed)<1e-9?0:(1-Math.abs(base.actualSpeed/base.shaftSpeed))*100}
}
