import { axialSector } from '../encoder/section'
import { useEffect, useMemo } from 'react'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { Material } from 'three'
import type { Vec3 } from '../../config/applications'
import type { ConveyorMaterials } from '../../conveyor/materials'
export function MetalBox({position=[0,0,0],size,material,rotation=[0,0,0],radius=.003}:{position?:Vec3;size:Vec3;material:Material;rotation?:Vec3;radius?:number}){
 const geometry=useMemo(()=>new RoundedBoxGeometry(...size,2,Math.min(radius,...size.map(n=>n/4))),[size[0],size[1],size[2],radius])
 useEffect(()=>()=>geometry.dispose(),[geometry])
 return <mesh position={position} rotation={rotation} geometry={geometry} material={material} castShadow receiveShadow/>
}
export function AxialCylinder({position=[0,0,0],radius,depth,material,segments=48}:{position?:Vec3;radius:number;depth:number;material:Material;segments?:number}){return <mesh position={position} rotation={[Math.PI/2,0,0]} material={material} castShadow receiveShadow><cylinderGeometry args={[radius,radius,depth,segments]}/></mesh>}
export function Bolt({position,material,radius=.009,rotation=[0,0,0]}:{position:Vec3;material:Material;radius?:number;rotation?:Vec3}){
 return <group position={position} rotation={rotation}><mesh material={material} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[radius*1.28,radius*1.28,radius*.2,24]}/></mesh><mesh position={[0,0,radius*.46]} material={material} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[radius,radius,radius*.85,6]}/></mesh><mesh position={[0,0,radius*.91]}><circleGeometry args={[radius*.36,6]}/><meshStandardMaterial color="#182328" roughness={.8}/></mesh></group>
}
export function SideFrame({materials:m}:{materials:ConveyorMaterials}){
 return <group>{[-.55,.55].map(z=><group key={z}>
  <MetalBox position={[0,.89,z]} size={[3.97,.155,.073]} material={m.aluminium}/>
  {[-.034,.034].map(dy=><MetalBox key={dy} position={[0,.89+dy,z+Math.sign(z)*.037]} size={[3.88,.008,.003]} material={m.recess} radius={.001}/>)}
  <MetalBox position={[0,.974,z]} size={[3.97,.015,.082]} material={m.steel}/>
  {[-1.45,1.45].map(x=><group key={x}>
   <MetalBox position={[x,.47,z]} size={[.08,.86,.08]} material={m.paint}/>
   <MetalBox position={[x,.092,z]} size={[.085,.13,.085]} material={m.steel}/>
   <mesh position={[x,.025,z]} material={m.rubber} receiveShadow castShadow><cylinderGeometry args={[.064,.073,.05,40]}/></mesh>
   <mesh position={[x,.105,z]} material={m.steel} castShadow><cylinderGeometry args={[.013,.013,.12,24]}/></mesh>
   <mesh position={[x,.116,z]} material={m.steel}><cylinderGeometry args={[.024,.024,.016,6]}/></mesh>
   <MetalBox position={[x,.81,z+Math.sign(z)*.047]} size={[.14,.23,.014]} material={m.paint}/>
   {[-.064,.064].map(dy=><Bolt key={dy} position={[x,.81+dy,z+Math.sign(z)*.059]} material={m.steel} rotation={z<0?[0,Math.PI,0]:[0,0,0]}/>)}
  </group>)}
 </group>)}
 {[-1.45,1.45].map(x=><MetalBox key={x} position={[x,.42,0]} size={[.065,.065,1.1]} material={m.paint}/>)}
 {[-1,1].map(z=><MetalBox key={z} position={[0,.42,z*.55]} size={[2.95,.055,.045]} material={m.paint}/>)}
 {[-.8,.8].map(x=><MetalBox key={x} position={[x,.99,0]} size={[.045,.07,.96]} material={m.steel}/>)}
 <MetalBox position={[0,1.006,0]} size={[3.34,.021,.81]} material={m.aluminium}/>
 {[-1.93,1.93].map(x=><group key={x}>{[-.55,.55].map(z=><MetalBox key={z} position={[x,.89,z]} size={[.055,.145,.079]} material={m.recess}/>)}</group>)}
 </group>
}
export function GearMotor({materials:m,cutaway=false}:{materials:ConveyorMaterials;cutaway?:boolean}){
 const sections=useMemo(()=>({shell:axialSector(.158,.147,.47),rear:axialSector(.165,.0128,.009,Math.PI,Math.PI/2),collar:axialSector(.173,.147,.044)}),[])
 useEffect(()=>()=>Object.values(sections).forEach(g=>g.dispose()),[sections])
 return <group position={[1.8,1.05,0]}>
  <MetalBox position={[0,-.28,-.9]} size={[.48,.11,.77]} material={m.paint}/>
  <MetalBox position={[0,0,-.715]} size={[.34,.37,.27]} material={m.motor} radius={.025}/>
  <AxialCylinder position={[0,0,-.563]} radius={.117} depth={.034} material={m.aluminium}/>
  <AxialCylinder position={[0,0,-.557]} radius={.055} depth={.045} material={m.steel}/>
  {[-.115,.115].map(x=><group key={x}><MetalBox position={[x,-.19,-.71]} size={[.09,.048,.24]} material={m.motor}/><Bolt position={[x,-.216,-.7]} rotation={[Math.PI/2,0,0]} material={m.steel}/></group>)}
  {Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return <Bolt key={i} position={[Math.cos(a)*.098,Math.sin(a)*.098,-.541]} material={m.steel} radius={.008}/>})}
  {cutaway?<mesh position={[0,0,-1.081]} geometry={sections.shell} material={m.motor} castShadow receiveShadow/>:<AxialCylinder position={[0,0,-1.081]} radius={.158} depth={.47} material={m.motor}/>}
  {Array.from({length:24},(_,i)=>{const a=i*Math.PI/12;if(cutaway&&a<Math.PI/2)return null;return <MetalBox key={i} position={[Math.cos(a)*.164,Math.sin(a)*.164,-1.08]} size={[.026,.008,.38]} rotation={[0,0,a]} radius={.0015} material={m.motor}/>})}
  <AxialCylinder position={[0,0,-.853]} radius={.18} depth={.025} material={m.aluminium}/>
  {cutaway?<mesh position={[0,0,-1.333]} geometry={sections.collar} material={m.recess}/>:<AxialCylinder position={[0,0,-1.333]} radius={.173} depth={.044} material={m.recess}/>}
  {cutaway?<mesh position={[0,0,-1.36]} geometry={sections.rear} material={m.motor}/>:<AxialCylinder position={[0,0,-1.36]} radius={.165} depth={.009} material={m.motor}/>}
  {!cutaway&&Array.from({length:8},(_,i)=><MetalBox key={i} position={[(i-3.5)*.031,0,-1.366]} size={[.008,Math.sqrt(Math.max(.001,.15*.15-((i-3.5)*.031)**2))*1.7,.004]} material={m.recess} radius={.001}/>)}
  <MetalBox position={[0,.192,-1.08]} size={[.15,.11,.15]} material={m.motor} radius={.008}/>
  <MetalBox position={[0,.253,-1.08]} size={[.16,.014,.16]} material={m.aluminium}/>
  {[-.055,.055].map(x=>[-1.135,-1.025].map(z=><Bolt key={`${x}-${z}`} position={[x,.263,z]} rotation={[-Math.PI/2,0,0]} material={m.steel} radius={.006}/>))}
  <AxialCylinder position={[.1,.192,-1.08]} radius={.023} depth={.055} material={m.recess}/>
  <MetalBox position={[.162,.012,-1.08]} size={[.003,.09,.21]} material={m.aluminium} radius={.001}/>
 </group>
}
