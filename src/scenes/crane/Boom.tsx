import { useEffect, useMemo } from 'react'
import { CatmullRomCurve3, ExtrudeGeometry, Path, Shape, Vector3 } from 'three'
import type { Material } from 'three'
import { AxialCylinder, Bolt, MetalBox } from '../conveyor/Hardware'
import type { CraneMaterials } from './materials'
import { CRANE } from '../../crane/kinematics'
function profile(width:number,height:number){const r=.07;return [[-width/2+r,-height/2], [width/2-r,-height/2],[width/2,-height/2+r],[width/2,height/2-r],[width/2-r,height/2],[-width/2+r,height/2],[-width/2,height/2-r],[-width/2,-height/2+r]]}
function BoomTube({length,width,height,material}:{length:number;width:number;height:number;material:Material}){
 const geometry=useMemo(()=>{const outer=profile(width,height),inner=profile(width-.035,height-.035).reverse();const shape=new Shape();outer.forEach((p,i)=>i?shape.lineTo(...p as [number,number]):shape.moveTo(...p as [number,number]));shape.closePath();const hole=new Path();inner.forEach((p,i)=>i?hole.lineTo(...p as [number,number]):hole.moveTo(...p as [number,number]));hole.closePath();shape.holes.push(hole);const g=new ExtrudeGeometry(shape,{depth:length,steps:1,bevelEnabled:false});g.rotateY(Math.PI/2);return g},[length,width,height])
 useEffect(()=>()=>geometry.dispose(),[geometry])
 return <mesh geometry={geometry} material={material} castShadow receiveShadow/>
}
export function Inclinometer({m,selected,onSelect}:{m:CraneMaterials;selected:boolean;onSelect?:()=>void}){
 const cable=useMemo(()=>new CatmullRomCurve3([new Vector3(.044,-.013,.008),new Vector3(.085,-.016,.01),new Vector3(.1,-.07,.006),new Vector3(-.04,-.09,-.008),new Vector3(-.25,-.09,-.008),new Vector3(-.55,-.09,-.008)]),[])
 // Verified overall IN88 envelope: 60 × 80 × 23 mm. Surface and bracket are illustrative.
 return <group position={CRANE.sensorMount} onClick={event=>{event.stopPropagation();onSelect?.()}}>
  <MetalBox position={[0,0,-.018]} size={[.11,.12,.009]} material={m.steel} radius={.005}/>
  {[-.044,.044].map(x=>[-.046,.046].map(y=><Bolt key={`${x}/${y}`} position={[x,y,-.011]} material={m.steel} radius={.004}/>))}
  <MetalBox size={[.06,.06,.023]} material={m.sensorMetal} radius={.007}/>
  {[[0,.031],[-.021,-.031],[.021,-.031]].map(([x,y])=><group key={`${x}/${y}`}><AxialCylinder position={[x,y,0]} radius={.009} depth={.023} material={m.sensorMetal} segments={24}/><Bolt position={[x,y,.013]} material={m.steel} radius={.0036}/></group>)}
  <MetalBox position={[0,0,.0122]} size={[.049,.051,.001]} material={m.sensorLabel} radius={.001}/>
  {[-.026,.026].map(y=><MetalBox key={y} position={[0,y,.013]} size={[.05,.0018,.001]} material={m.orange} radius={.0002}/>)}
  {[-.013,.012].map(y=><group key={y} position={[.033,y,0]} rotation={[0,Math.PI/2,0]}><AxialCylinder radius={.006} depth={.018} material={m.steel} segments={24}/><AxialCylinder position={[0,0,.011]} radius={.005} depth={.004} material={m.recess}/>{[0,1,2,3,4].map(i=><mesh key={i} position={[0,0,-.005+i*.0022]} material={m.steel}><torusGeometry args={[.006,.00025,6,24]}/></mesh>)}{[0,1,2,3,4].map(i=>{const a=i*Math.PI*2/5;return <AxialCylinder key={i} position={[Math.cos(a)*.0025,Math.sin(a)*.0025,.0132]} radius={.00045} depth={.001} material={m.steel} segments={8}/>})}</group>)}
  <mesh material={m.rubber}><tubeGeometry args={[cable,32,.0035,8,false]}/></mesh>
  {[-.18,-.4].map(x=><MetalBox key={x} position={[x,-.09,-.006]} size={[.014,.014,.011]} material={m.steel} radius={.002}/>)}
  {selected&&<mesh position={[0,0,.016]}><ringGeometry args={[.074,.076,64]}/><meshBasicMaterial color="#ff9d50" depthTest={false} transparent opacity={.9}/></mesh>}
 </group>
}
export function BaseBoom({m,selected,onSelect}:{m:CraneMaterials;selected:boolean;onSelect?:()=>void}){
 return <group>
  <BoomTube length={CRANE.baseLength} width={.7} height={.66} material={m.yellow}/>
  <AxialCylinder radius={.18} depth={.98} material={m.steel}/>
  {[-1,1].map(side=><group key={side}>
   <MetalBox position={[.25,0,side*.36]} size={[.7,.5,.035]} material={m.yellow} radius={.04}/>
   <AxialCylinder position={[0,0,side*.49]} radius={.12} depth={.045} material={m.dark}/>
   <Bolt position={[0,0,side*.52]} rotation={[0,side<0?Math.PI:0,0]} material={m.steel} radius={.035}/>
   <MetalBox position={[3,.01,side*.352]} size={[2.05,.2,.003]} material={m.brand} rotation={[0,side<0?Math.PI:0,0]} radius={.001}/>
   <MetalBox position={[2.35,-.31,side*.3]} size={[.75,.18,.065]} material={m.yellow} radius={.02}/>
   <AxialCylinder position={[2.5,-.35,side*.32]} radius={.11} depth={.13} material={m.steel}/>
   {[1.6,2.9,4.1].map(x=><MetalBox key={x} position={[x,-.26,side*.33]} size={[.038,.02,.012]} material={m.steel} radius={.003}/>)}
  </group>)}
  <MetalBox position={[CRANE.baseLength-.09,0,0]} size={[.18,.69,.74]} material={m.dark} radius={.028}/>
  {[-.25,.25].map(y=>[-.26,.26].map(z=><Bolt key={`${y}/${z}`} position={[CRANE.baseLength+.01,y,z]} rotation={[0,Math.PI/2,0]} material={m.steel} radius={.014}/>))}
  {/* Fixed hydraulic service lines on the rear of the base boom. */}
  {[-.21,-.15].map(y=><group key={y}><mesh position={[2.45,y,-.367]} rotation={[0,0,Math.PI/2]} material={m.rubber}><cylinderGeometry args={[.012,.012,3.7,12]}/></mesh>{[.7,1.65,2.6,3.55,4.2].map(x=><MetalBox key={x} position={[x,y,-.38]} size={[.04,.045,.022]} material={m.steel} radius={.003}/>)}</group>)}
  <Inclinometer m={m} selected={selected} onSelect={onSelect}/>
 </group>
}
export function MiddleBoom({m}:{m:CraneMaterials}){return <group><BoomTube length={CRANE.middleLength} width={.58} height={.54} material={m.yellow}/><MetalBox position={[CRANE.middleLength-.07,0,0]} size={[.14,.565,.605]} material={m.dark} radius={.02}/>{[-.235,.235].map(z=><MetalBox key={z} position={[2.65,.269,z]} size={[4.9,.012,.035]} material={m.steel} radius={.002}/>)}</group>}
export function InnerBoom({m}:{m:CraneMaterials}){return <group><BoomTube length={CRANE.innerLength} width={.46} height={.42} material={m.yellow}/><MetalBox position={[CRANE.innerLength,-.015,0]} size={[.35,.47,.53]} material={m.dark} radius={.045}/><MetalBox position={[CRANE.innerLength+.22,-.025,0]} size={[.46,.28,.42]} material={m.dark} radius={.025}/>{[-.23,.23].map(z=><MetalBox key={z} position={[CRANE.innerLength+.45,-.12,z]} size={[.53,.37,.055]} material={m.yellow} rotation={[0,0,-.22]} radius={.035}/>)}<AxialCylinder position={[CRANE.innerLength+.58,-.1,0]} radius={.16} depth={.39} material={m.steel}/><AxialCylinder position={[CRANE.innerLength+.58,-.1,0]} radius={.13} depth={.4} material={m.dark}/></group>}
