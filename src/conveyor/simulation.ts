/** SI units. Ideal no-stretch belt with a 160 mm effective drive radius. */
export const TAU = 2 * Math.PI
export const CONVEYOR = Object.freeze({ rollerRadius: .16, rollerCenters: 3.6, shaftHeight: 1.05, beltWidth: .85, ppr: 1024, accelerationRPM: 30, maxRPM: 120, slipFraction: .15, signalDivider: 256 })
export interface ConveyorMotion {
  elapsed: number; rpm: number; targetRPM: number; running: boolean; direction: 1 | -1;
  shaftRadians: number; beltTravel: number; totalBeltTravel: number; slip: boolean
}
export const initialConveyorMotion = (): ConveyorMotion => ({ elapsed: 0, rpm: 0, targetRPM: 60, running: false, direction: 1, shaftRadians: 0, beltTravel: 0, totalBeltTravel: 0, slip: false })
export function wrap(value:number,length:number) { const result=((value%length)+length)%length; return result<1e-10 || length-result<1e-10 ? 0 : result }
export function quadrature(phase: number) {
  const cycle = wrap(phase, 1)
  return { a: cycle < .5 ? 1 : 0, b: cycle >= .25 && cycle < .75 ? 1 : 0 }
}
export function conveyorReadout(state: ConveyorMotion) {
  const turns = state.shaftRadians / TAU
  const omega = state.rpm * TAU / 60
  return {
    turns, degrees: wrap(turns * 360, 360), pulseCount: Math.floor(turns * CONVEYOR.ppr + 1e-8),
    quadratureCount: Math.floor(turns * CONVEYOR.ppr * 4 + 1e-8),
    frequency: Math.abs(state.rpm) / 60 * CONVEYOR.ppr,
    shaftSpeed: omega * CONVEYOR.rollerRadius,
    actualSpeed: omega * CONVEYOR.rollerRadius * (state.slip ? 1 - CONVEYOR.slipFraction : 1),
    inferredTravel: state.shaftRadians * CONVEYOR.rollerRadius,
    direction: Math.abs(state.rpm) < 1e-8 ? 'Stopped' : state.rpm > 0 ? 'Forward' : 'Reverse',
    signals: quadrature(turns * CONVEYOR.ppr),
  }
}
/** Exact piecewise-linear ramps, including the zero-speed boundary during reversal. */
export function advanceConveyor(input: ConveyorMotion, seconds: number): ConveyorMotion {
  if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('A finite nonnegative time step is required')
  const state = { ...input }
  let remaining = seconds
  while (remaining > 1e-10) {
    const finalRPM = state.running ? state.direction * state.targetRPM : 0
    const rampTarget = state.rpm * finalRPM < 0 ? 0 : finalRPM
    const difference = rampTarget - state.rpm
    const timeToTarget = Math.abs(difference) / CONVEYOR.accelerationRPM
    const duration = Math.abs(difference) < 1e-9 ? remaining : Math.min(remaining, timeToTarget)
    const nextRPM = Math.abs(difference) < 1e-9 ? rampTarget : state.rpm + Math.sign(difference) * CONVEYOR.accelerationRPM * duration
    const angle = (state.rpm + nextRPM) * .5 * TAU / 60 * duration
    const beltDistance = angle * CONVEYOR.rollerRadius * (state.slip ? 1 - CONVEYOR.slipFraction : 1)
    state.shaftRadians += angle
    state.beltTravel += beltDistance
    state.totalBeltTravel += Math.abs(beltDistance)
    state.rpm = Math.abs(nextRPM) < 1e-9 ? 0 : nextRPM
    state.elapsed += duration
    remaining -= duration
  }
  return state
}
