/** Future machine adapters use one authoritative state; no fabricated telemetry. */
export interface MotionState { shaftRadians: number; boomRadians: number; extensionMeters: number; carouselRadians: number }
export const initialMotion: Readonly<MotionState> = Object.freeze({ shaftRadians: 0, boomRadians: Math.PI / 4, extensionMeters: 0, carouselRadians: 0 })
export function encoderMeasurement(radians: number, pulsesPerRevolution: number) {
  if (!Number.isFinite(radians) || !Number.isInteger(pulsesPerRevolution) || pulsesPerRevolution <= 0) throw new RangeError('Finite angle and positive integer PPR required')
  return { degrees: ((radians * 180 / Math.PI) % 360 + 360) % 360, netQuadratureCount: Math.floor(radians / (2 * Math.PI) * pulsesPerRevolution * 4) }
}
export function cablePayout(housing: readonly number[], anchor: readonly number[]) {
  if (housing.length !== 3 || anchor.length !== 3 || [...housing, ...anchor].some(n => !Number.isFinite(n))) throw new RangeError('Two finite 3D positions required')
  return Math.hypot(...housing.map((n, i) => anchor[i] - n))
}
