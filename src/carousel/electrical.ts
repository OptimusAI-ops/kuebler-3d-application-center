import type { Vec3 } from '../config/applications'
export const SLIP_RING_OFFSET_Y=-1.55
// Assembly-local coordinates. The complete interface mounts inside the drive pedestal.
export const STATOR_POWER:Vec3[]=[[-2.45,2.3,-1.25],[-2.45,1.65,-1.25],[-1.3,1.65,-1.25],[0,1.64,-.18],[.065,1.79,-.055],[.055,1.815,0]]
export const STATOR_SIGNAL:Vec3[]=STATOR_POWER.map(([x,y,z],i)=>[x-.012,y+(i>3?.05:.014),z-.014])
// The rotor output enters the hollow shaft above the unit, then exits below the fixed torque arm.
export const ROTOR_POWER:Vec3[]=[[.032,1.94,0],[.055,1.99,0],[.012,2.025,0],[0,2.0,0],[0,1.94,0],[0,1.72,0],[0,1.65,0],[.012,1.638,0],[.04,1.638,.015],[.3,1.638,.015],[.7,1.638,.015],[.98,1.61,0]]
export const ROTOR_SIGNAL:Vec3[]=ROTOR_POWER.map(([x,y,z],i)=>[x,y,z+(i>=3&&i<=7?-.003:-.008)])
export const POWER_LEVELS=[1.805,1.823]
export const SIGNAL_LEVELS=[1.862,1.88]
export const TRACK_RADIUS=.03
