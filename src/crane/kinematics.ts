/** SI geometry for an illustrative crane, not a production lifting model. */
export type Point3 = [number, number, number]
export const CRANE = {
 minAngle:0, maxAngle:75, speed:6, acceleration:12,
 pivot:[-1,2.8,0] as Point3,
 sensorMount:[1.2,.03,.3715] as Point3,
 sensorMountOffsetDegrees:0,
 cylinderLower:[-.5,1.25,0] as Point3,
 cylinderUpper:[2.5,-.35,0] as Point3,
 cylinderBarrelLength:2.05,
 baseLength:6, middleLength:5.6, innerLength:5.2,
 maxExtension:8, initialExtension:2.4, extensionSpeed:.65, extensionAcceleration:.5,
 drawWireHousing:[5.3,-.11,.43] as Point3,
 drawWireAnchor:[5.55,-.065,.43] as Point3,
} as const
export interface CraneMotion { boomAngleDegrees:number; angularVelocity:number; boomExtensionMeters:number; extensionVelocity:number; slewDegrees:number }
export const initialCraneMotion=():CraneMotion=>({boomAngleDegrees:30,angularVelocity:0,boomExtensionMeters:CRANE.initialExtension,extensionVelocity:0,slewDegrees:0})
export function boomPointToWorld(point:Point3,state:CraneMotion):Point3 {
 const a=state.boomAngleDegrees*Math.PI/180,s=state.slewDegrees*Math.PI/180
 const x=point[0]*Math.cos(a)-point[1]*Math.sin(a)+CRANE.pivot[0]
 const y=point[0]*Math.sin(a)+point[1]*Math.cos(a)+CRANE.pivot[1]
 return [x*Math.cos(s)+point[2]*Math.sin(s),y,-x*Math.sin(s)+point[2]*Math.cos(s)]
}
export const sensorWorldPosition=(state:CraneMotion)=>boomPointToWorld([...CRANE.sensorMount],state)
export const middleSectionX=(extension:number)=>.35+extension/2
export const innerSectionX=(extension:number)=>.7+extension
export const boomTipLocal=(state:CraneMotion):Point3=>[innerSectionX(state.boomExtensionMeters)+CRANE.innerLength+.58,-.1,0]
export function cylinderGeometry(state:CraneMotion,z=.24) {
 const lower:Point3=[CRANE.cylinderLower[0],CRANE.cylinderLower[1],z]
 const upper=boomPointToWorld([CRANE.cylinderUpper[0],CRANE.cylinderUpper[1],z],state)
 // Lower pin is on the slewing upper structure, but does not pitch with the boom.
 const s=state.slewDegrees*Math.PI/180
 const base:Point3=[lower[0]*Math.cos(s)+z*Math.sin(s),lower[1],-lower[0]*Math.sin(s)+z*Math.cos(s)]
 return {lower:base,upper,length:Math.hypot(...upper.map((n,i)=>n-base[i]))}
}
export function inclinometerReading(state:CraneMotion) {
 const raw=state.boomAngleDegrees+CRANE.sensorMountOffsetDegrees
 return raw-CRANE.sensorMountOffsetDegrees
}
export function advanceCrane(state:CraneMotion,seconds:number,target:number|null):CraneMotion {
 if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('Invalid frame duration')
 const dt=seconds,angle=state.boomAngleDegrees
 const remaining=target===null?0:Math.max(CRANE.minAngle,Math.min(CRANE.maxAngle,target))-angle
 const desired=target===null?0:Math.sign(remaining)*Math.min(CRANE.speed,Math.sqrt(2*CRANE.acceleration*Math.abs(remaining)))
 const dv=Math.max(-CRANE.acceleration*dt,Math.min(CRANE.acceleration*dt,desired-state.angularVelocity))
 let velocity=state.angularVelocity+dv,next=angle+(state.angularVelocity+velocity)*.5*dt
 if(target!==null&&Math.abs(remaining)<Math.abs(next-angle)+1e-8){next=target;velocity=0}
 if(next<=CRANE.minAngle){next=CRANE.minAngle;velocity=0}
 if(next>=CRANE.maxAngle){next=CRANE.maxAngle;velocity=0}
 return {...state,boomAngleDegrees:next,angularVelocity:velocity}
}

export function advanceExtension(state:CraneMotion,seconds:number,target:number|null):CraneMotion {
 if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('Invalid frame duration')
 const goal=target===null?null:Math.max(0,Math.min(CRANE.maxExtension,target))
 const remaining=goal===null?0:goal-state.boomExtensionMeters
 const desired=goal===null?0:Math.sign(remaining)*Math.min(CRANE.extensionSpeed,Math.sqrt(2*CRANE.extensionAcceleration*Math.abs(remaining)))
 const dv=Math.max(-CRANE.extensionAcceleration*seconds,Math.min(CRANE.extensionAcceleration*seconds,desired-state.extensionVelocity))
 let velocity=state.extensionVelocity+dv,value=state.boomExtensionMeters+(state.extensionVelocity+velocity)*.5*seconds
 if(goal!==null&&Math.abs(remaining)<Math.abs(value-state.boomExtensionMeters)+1e-10){value=goal;velocity=0}
 if(value<=0){value=0;velocity=0}
 if(value>=CRANE.maxExtension){value=CRANE.maxExtension;velocity=0}
 return {...state,boomExtensionMeters:value,extensionVelocity:velocity}
}
