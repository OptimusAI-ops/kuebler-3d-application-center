import { useLayoutEffect, useRef } from 'react'
import { InstancedMesh, Object3D } from 'three'
import { AxialCylinder, Bolt, MetalBox } from '../conveyor/Hardware'
import type { CraneMaterials } from './materials'
import type { Vec3 } from '../../config/applications'
function Wheel({position,side,m}:{position:Vec3;side:number;m:CraneMaterials}){
 const tread=useRef<InstancedMesh>(null)
 useLayoutEffect(()=>{const object=new Object3D();for(let i=0;i<40;i++){const a=i/40*Math.PI*2;object.position.set(Math.cos(a)*.505,Math.sin(a)*.505,0);object.rotation.set(0,0,a);object.updateMatrix();tread.current?.setMatrixAt(i,object.matrix)}if(tread.current)tread.current.instanceMatrix.needsUpdate=true},[])
 return <group position={position}>
  <AxialCylinder radius={.505} depth={.33} material={m.rubber} segments={64}/>
  <instancedMesh ref={tread} args={[undefined,m.rubber,40]} castShadow><boxGeometry args={[.031,.055,.34]}/></instancedMesh>
  <AxialCylinder position={[0,0,side*.171]} radius={.35} depth={.018} material={m.rubber}/>
  <AxialCylinder position={[0,0,side*.185]} radius={.292} depth={.04} material={m.aluminium}/>
  <AxialCylinder position={[0,0,side*.21]} radius={.176} depth={.05} material={m.dark}/>
  <AxialCylinder position={[0,0,side*.243]} radius={.092} depth={.05} material={m.steel}/>
  {Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return <group key={i}><Bolt position={[Math.cos(a)*.138,Math.sin(a)*.138,side*.245]} rotation={[0,side<0?Math.PI:0,0]} material={m.steel} radius={.017}/><AxialCylinder position={[Math.cos(a)*.238,Math.sin(a)*.238,side*.209]} radius={.027} depth={.008} material={m.recess}/></group>})}
  <mesh position={[0,0,side*.208]} material={m.steel}><torusGeometry args={[.285,.012,8,64]}/></mesh>
 </group>
}
function Outrigger({x,side,m}:{x:number;side:number;m:CraneMaterials}){
 return <group position={[x,0,0]}>
  <MetalBox position={[0,.93,side*.85]} size={[.44,.34,1.65]} material={m.dark} radius={.014}/>
  <MetalBox position={[0,.95,side*1.92]} size={[.32,.24,1.75]} material={m.yellow} radius={.008}/>
  <MetalBox position={[0,.95,side*2.71]} size={[.39,.3,.13]} material={m.dark}/>
  <mesh position={[0,.7,side*2.72]} material={m.yellow} castShadow><cylinderGeometry args={[.13,.13,.8,32]}/></mesh>
  <mesh position={[0,.31,side*2.72]} material={m.steel} castShadow><cylinderGeometry args={[.078,.078,.45,32]}/></mesh>
  <mesh position={[0,.1,side*2.72]} material={m.dark} castShadow receiveShadow><cylinderGeometry args={[.25,.29,.1,40]}/></mesh>
  <MetalBox position={[0,.025,side*2.72]} size={[.72,.05,.72]} material={m.recess} radius={.018}/>
  <Bolt position={[.21,.95,side*2.7]} rotation={[0,Math.PI/2,0]} material={m.steel} radius={.026}/>
  {[0,1,2].map(i=><MetalBox key={i} position={[0,.978,side*(2.17+i*.14)]} size={[.325,.02,.07]} rotation={[0,0,0]} material={m.recess} radius={.001}/>)}
 </group>
}
export function TruckCab({m}:{m:CraneMaterials}){
 return <group position={[3.12,0,0]}>
  <MetalBox position={[0,1.4,0]} size={[1.88,1.63,2.3]} material={m.cream} radius={.08}/>
  <MetalBox position={[.02,2.25,0]} size={[1.9,.12,2.34]} material={m.cream} radius={.04}/>
  <MetalBox position={[.964,1.88,0]} size={[.025,.62,2.02]} material={m.glass} rotation={[0,0,.07]} radius={.035}/>
  <MetalBox position={[.989,1.88,0]} size={[.026,.65,.045]} material={m.cream}/>
  {[-1,1].map(side=><group key={side}>
   <MetalBox position={[-.08,1.87,side*1.157]} size={[1.52,.61,.025]} material={m.glass} radius={.045}/>
   <MetalBox position={[-.48,1.9,side*1.18]} size={[.04,.67,.02]} material={m.cream}/>
   <MetalBox position={[-.1,1.39,side*1.174]} size={[1.45,.025,.014]} material={m.dark}/>
   <MetalBox position={[-.6,1.44,side*1.187]} size={[.19,.035,.025]} material={m.recess}/>
   <MetalBox position={[-.35,.69,side*1.2]} size={[.86,.08,.18]} material={m.aluminium}/>
   <MetalBox position={[-.35,.88,side*1.18]} size={[.86,.06,.13]} material={m.aluminium}/>
   <MetalBox position={[.8,1.85,side*1.28]} size={[.04,.045,.24]} material={m.dark}/>
   <MetalBox position={[.81,1.79,side*1.42]} size={[.11,.35,.11]} material={m.dark} radius={.025}/>
   <MetalBox position={[.81,1.79,side*1.48]} size={[.08,.29,.008]} material={m.steel}/>
   <MetalBox position={[.1,2.36,side*.82]} size={[.23,.1,.16]} material={m.orange} radius={.025}/>
   <MetalBox position={[.971,1.25,side*.79]} size={[.025,.17,.44]} material={m.lamp} radius={.025}/>
   <MetalBox position={[.978,1.25,side*1.055]} size={[.03,.17,.06]} material={m.orange}/>
  </group>)}
  <MetalBox position={[.99,.98,0]} size={[.12,.25,2.4]} material={m.dark} radius={.028}/>
  {Array.from({length:6},(_,i)=><MetalBox key={i} position={[.962,1.12+i*.055,0]} size={[.025,.022,.85]} material={m.recess}/>) }
  {[-.5,.5].map(z=><MetalBox key={z} position={[.992,1.68,z]} size={[.015,.019,.65]} rotation={[.25,0,0]} material={m.recess}/>)}
 </group>
}
export function Chassis({materials:m}:{materials:CraneMaterials}){
 return <group>
  {[-.65,.65].map(z=><MetalBox key={z} position={[-.2,.83,z]} size={[8.25,.32,.15]} material={m.dark} radius={.012}/>)}
  {[-3.6,-2.5,-1.2,0,1.2,2.4,3.6].map(x=><MetalBox key={x} position={[x,.85,0]} size={[.14,.25,1.65]} material={m.dark}/>)}
  {[-2.85,-1.55,1.35,2.65].map(x=><group key={x}><AxialCylinder position={[x,.52,0]} radius={.095} depth={2.3} material={m.dark}/>{[-1,1].map(side=><Wheel key={side} position={[x,.53,side*1.11]} side={side} m={m}/>)}</group>)}
  <MetalBox position={[-.9,1.08,0]} size={[6.4,.15,2.47]} material={m.yellow} radius={.02}/>
  {[-1,1].map(side=><group key={side}>
   <MetalBox position={[-.85,1.18,side*1.17]} size={[6.3,.09,.19]} material={m.dark}/>
   {[-2.85,-1.55,1.35].map(x=><MetalBox key={x} position={[x,1.08,side*1.18]} size={[1.17,.09,.52]} material={m.yellow} radius={.04}/>)}
   <MetalBox position={[-.05,.66,side*1.0]} size={[1.12,.45,.35]} material={m.aluminium} radius={.065}/>
   {[-.39,.25].map(x=><MetalBox key={x} position={[x,.66,side*1.18]} size={[.045,.46,.025]} material={m.dark}/>)}
   <MetalBox position={[-3.85,1.12,side*.88]} size={[.06,.1,.36]} material={m.red}/>
  </group>)}
  {[-3.55,1.55].map(x=>[-1,1].map(side=><Outrigger key={`${x}/${side}`} x={x} side={side} m={m}/>))}
  <MetalBox position={[-4.05,.91,0]} size={[.18,.24,2.4]} material={m.dark}/>
  <TruckCab m={m}/>
 </group>
}
