import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { MetalBox } from './Hardware'
import type { ConveyorMaterials } from '../../conveyor/materials'
import type { ConveyorController } from '../../conveyor/controller'
import { CONVEYOR, wrap } from '../../conveyor/simulation'
export function Parcel({index,controller,materials:m}:{index:number;controller:ConveyorController;materials:ConveyorMaterials}) {
 const group=useRef<Group>(null)
 const surfaces=useMemo(()=>({paper:m.cardboard.clone(),tape:m.tape.clone(),label:m.labelMaterial.clone()}),[m])
 useEffect(()=>()=>Object.values(surfaces).forEach(material=>material.dispose()),[surfaces])
 useFrame(()=>{if(!group.current)return;const x=wrap(controller.motion.beltTravel+index*1.47,4.4)-2.2;group.current.position.x=x;group.current.visible=Math.abs(x)<=CONVEYOR.rollerCenters/2-w/2})
 const h=[.36,.28,.42][index],w=[.5,.4,.48][index]
 return <group ref={group} position={[index*1.47-2.2,CONVEYOR.shaftHeight+CONVEYOR.rollerRadius+.007+h/2,0]}>
  <MetalBox size={[w,h,.43]} material={surfaces.paper} radius={.003}/>
  <MetalBox position={[0,h/2+.001,0]} size={[.061,.0015,.433]} material={surfaces.tape} radius={.0004}/>
  {[-1,1].map(side=><group key={side}>
   <MetalBox position={[0,0,side*.216]} size={[.061,h,.0012]} material={surfaces.tape} radius={.0003}/>
   <MetalBox position={[0,h*.39,side*.216]} size={[w-.008,.0015,.0012]} material={surfaces.paper} radius={.0002}/>
  </group>)}
  <mesh position={[w*.18,-h*.015,.217]} material={surfaces.label}><planeGeometry args={[w*.42,h*.6]}/></mesh>
  <mesh position={[-w*.17,h/2+.002,.02]} rotation={[-Math.PI/2,0,Math.PI/2]} material={surfaces.label}><planeGeometry args={[.155,.12]}/></mesh>
 </group>
}
