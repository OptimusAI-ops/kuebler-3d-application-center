import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, LatheGeometry, Vector2, Vector3 } from 'three'
import type { Group, Mesh } from 'three'
import { CAROUSEL, bottlePath, TAU } from '../../carousel/simulation'
import type { CarouselController } from '../../carousel/controller'
import { AxialCylinder, Bolt, MetalBox } from '../conveyor/Hardware'
import { Ring, VerticalCylinder } from './Hardware'
import type { CarouselMaterials } from './materials'
export function MachineBase({m}:{m:CarouselMaterials}){
 return <group>
  {[-1.04,1.04].map(x=>[-1.04,1.04].map(z=><group key={`${x}/${z}`}><MetalBox position={[x,.44,z]} size={[.065,.8,.065]} material={m.stainless} radius={.006}/><VerticalCylinder position={[x,.07,z]} radius={.014} height={.13} material={m.steel}/><VerticalCylinder position={[x,.023,z]} radius={.06} height={.035} material={m.rubber}/><MetalBox position={[x,.81,z]} size={[.15,.14,.02]} material={m.stainless}/><Bolt position={[x,.83,z+.018]} material={m.steel}/></group>))}
  {[-1.04,1.04].map(a=><group key={a}><MetalBox position={[a,.36,0]} size={[.06,.08,2.13]} material={m.stainless}/><MetalBox position={[0,.36,a]} size={[2.13,.08,.06]} material={m.stainless}/><MetalBox position={[a,.79,0]} size={[.065,.08,2.14]} material={m.stainless}/><MetalBox position={[0,.79,a]} size={[2.14,.08,.065]} material={m.stainless}/></group>)}
  <MetalBox position={[0,.72,0]} size={[2.09,.025,2.09]} material={m.stainless}/>
  <VerticalCylinder position={[0,.79,0]} radius={.23} height={.31} material={m.structure}/><VerticalCylinder position={[0,.62,0]} radius={.13} height={.2} material={m.stainless}/>
  <MetalBox position={[.39,.51,0]} size={[.46,.34,.34]} material={m.structure} radius={.035}/><AxialCylinder position={[.62,.51,0]} radius={.13} depth={.3} material={m.structure}/>
  <Ring position={[0,.865,0]} outer={1.34} inner={.16} height={.045} material={m.stainless}/><Ring position={[0,.892,0]} outer={1.34} inner={1.3} height={.035} material={m.stainless}/>
  <VerticalCylinder position={[0,.91,0]} radius={.13} height={.11} material={m.sensorBlack}/>
  {/* This fixed rear post and cantilever carry the stator torque stop, outside the rotating head envelope. */}
  <MetalBox position={[0,.98,-1.52]} size={[.09,1.91,.09]} material={m.stainless}/><MetalBox position={[0,1.765,-.795]} size={[.05,.055,1.41]} material={m.stainless}/>
  <MetalBox position={[0,.03,-1.52]} size={[.26,.035,.24]} material={m.stainless}/>{[-.08,.08].map(x=><Bolt key={x} position={[x,.054,-1.52]} rotation={[-Math.PI/2,0,0]} material={m.steel}/>)}
  {[-Math.PI*.08,Math.PI*.36,Math.PI*.68,Math.PI*1.06].map(a=><group key={a} position={[Math.cos(a)*1.39,0,-Math.sin(a)*1.39]}><VerticalCylinder position={[0,1.23,0]} radius={.018} height={.72} material={m.stainless}/><VerticalCylinder position={[0,1.59,0]} radius={.032} height={.025} material={m.stainless}/></group>)}
  <mesh position={[0,1.255,0]} material={m.guard}><cylinderGeometry args={[1.385,1.385,.67,96,1,true,0,Math.PI]}/></mesh>
  <mesh position={[0,1.59,0]} rotation={[Math.PI/2,0,0]} material={m.stainless}><torusGeometry args={[1.39,.015,8,96,Math.PI]}/></mesh>
  <group position={[-1.7,0,-.65]}>
   <MetalBox position={[0,.86,0]} size={[.52,1.25,.35]} material={m.stainless} radius={.025}/>
   <MetalBox position={[0,1.12,.185]} size={[.4,.28,.018]} material={m.screen} radius={.01}/>
   {[-.23,.23].map(x=>[.31,1.4].map(y=><Bolt key={`${x}/${y}`} position={[x,y,.182]} material={m.steel} radius={.008}/>))}
   {Array.from({length:7},(_,i)=><MetalBox key={i} position={[-.262,.55+i*.05,0]} size={[.004,.012,.22]} material={m.recess} radius={.002}/>)}
   <MetalBox position={[.19,.76,.19]} size={[.025,.15,.04]} material={m.sensorBlack}/>
   {[-.13,0,.13].map((x,i)=><AxialCylinder key={i} position={[x,.65,.19]} radius={.025} depth={.018} material={i===2?m.sensorRed:i===0?m.green:m.sensorBlack}/>)}
   <VerticalCylinder position={[0,1.57,0]} radius={.014} height={.19} material={m.stainless}/><VerticalCylinder position={[0,1.71,0]} radius={.035} height={.08} material={m.green}/>
   {[-.17,.17].map(x=><MetalBox key={x} position={[x,.21,0]} size={[.045,.28,.045]} material={m.stainless}/>)}
  </group>
 </group>
}
export function FeedConveyors({m}:{m:CarouselMaterials}){return <group>{[-1,1].map(side=><group key={side} position={[side*CAROUSEL.pitchRadius,0,.92]}>
 <MetalBox position={[0,.958,0]} size={[.3,.07,1.92]} material={m.stainless}/><MetalBox position={[0,.995,0]} size={[.29,.01,1.91]} material={m.rubber}/>
 {[-.91,.91].map(z=><group key={z} rotation={[0,Math.PI/2,0]} position={[0,.953,z]}><AxialCylinder radius={.044} depth={.31} material={m.aluminium}/></group>)}
 {[-.19,.19].map(x=><group key={x}><MetalBox position={[x,1.07,0]} size={[.018,.028,1.9]} material={m.stainless}/>{[-.65,.6].map(z=><MetalBox key={z} position={[x,.99,z]} size={[.025,.19,.025]} material={m.stainless}/>)}</group>)}
 {[-.65,.65].map(z=>[-.13,.13].map(x=><group key={`${z}/${x}`}><MetalBox position={[x,.48,z]} size={[.045,.88,.045]} material={m.stainless}/><VerticalCylinder position={[x,.025,z]} radius={.045} height={.04} material={m.rubber}/></group>))}
 {/* End hoods conceal the educational off-stage recirculation, avoiding visible bottle teleportation. */}
 <MetalBox position={[0,1.385,.64]} size={[.43,.035,.58]} material={m.stainless} radius={.01}/>{[-.205,.205].map(x=><MetalBox key={x} position={[x,1.185,.64]} size={[.025,.4,.58]} material={m.stainless}/>)}<MetalBox position={[0,1.18,.925]} size={[.43,.42,.02]} material={m.structure}/>
 <MetalBox position={[0,.76,.88]} size={[.14,.17,.02]} material={side>0?m.cyan:m.amber}/>
 </group>)}</group>}
export function RotatingEquipment({m}:{m:CarouselMaterials}){return <group>
 <VerticalCylinder position={[0,.94,0]} radius={.82} height={.1} material={m.stainless}/><Ring position={[0,1.0,0]} outer={.8} inner={.77} height={.012} material={m.structure}/>
 {Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <Bolt key={i} position={[.195*Math.cos(a),1.081,.195*Math.sin(a)]} rotation={[-Math.PI/2,0,0]} radius={.009} material={m.steel}/>})}
 <Ring position={[0,1.04,0]} outer={.23} inner={.065} height={.07} material={m.stainless}/><VerticalCylinder position={[0,1.3,0]} radius={.06} height={.59} material={m.stainless}/>
 <Ring position={[0,1.6,0]} outer={.28} inner={.016} height={.075} material={m.stainless}/>
 <mesh position={[0,1.638,0]} rotation={[Math.PI/2,0,0]} material={m.rubber}><torusGeometry args={[.88,.005,8,96]}/></mesh>
 {Array.from({length:CAROUSEL.stations},(_,i)=>{const a=i*TAU/CAROUSEL.stations,x=Math.cos(a)*CAROUSEL.pitchRadius,z=-Math.sin(a)*CAROUSEL.pitchRadius;return <group key={i}>
  <MetalBox position={[Math.cos(a)*.61,1.6,-Math.sin(a)*.61]} size={[.78,.035,.035]} rotation={[0,a,0]} material={m.stainless}/>
  <group position={[x,1.275,z]} rotation={[0,a,0]}><MetalBox position={[-.033,0,.015]} size={[.012,.018,.075]} material={m.structure}/><MetalBox position={[.033,0,.015]} size={[.012,.018,.075]} material={m.structure}/><MetalBox position={[0,0,-.025]} size={[.078,.018,.012]} material={m.structure}/><MetalBox position={[0,.075,-.043]} size={[.025,.15,.025]} material={m.stainless}/></group>
  <VerticalCylinder position={[x,1.44,z]} radius={.038} height={.18} material={m.stainless}/><VerticalCylinder position={[x,1.325,z]} radius={.012} height={.05} material={m.steel}/>
  <MetalBox position={[x,1.57,z]} size={[.07,.07,.08]} material={m.structure} radius={.012}/>
  <Bolt position={[x,1.612,z]} rotation={[-Math.PI/2,0,0]} material={m.steel} radius={.007}/>
 </group>})}
 </group>}
export function ProcessBottles({controller,m}:{controller:CarouselController;m:CarouselMaterials}){
 const geometry=useMemo(()=>new LatheGeometry([[.044,0],[.05,.012],[.05,.205],[.046,.229],[.026,.263],[.024,.296],[.027,.302]].map(p=>new Vector2(...p as [number,number])),40),[])
 useEffect(()=>()=>geometry.dispose(),[geometry])
 return <group>{Array.from({length:CAROUSEL.stations},(_,i)=><ProcessBottle key={i} index={i} controller={controller} m={m} geometry={geometry}/>)}</group>
}
function ProcessBottle({index,controller,m,geometry}:{index:number;controller:CarouselController;m:CarouselMaterials;geometry:LatheGeometry}){
 const bottle=useRef<Group>(null),liquid=useRef<Mesh>(null),jet=useRef<Mesh>(null)
 useFrame(()=>{
  const state=controller.motion,path=bottlePath(state.angleRadians,index),level=state.fillLevels[index]
  if(bottle.current){bottle.current.position.set(...path.position);bottle.current.visible=path.visible}
  if(liquid.current){liquid.current.scale.y=Math.max(.001,level);liquid.current.position.y=.012+level*.1;liquid.current.visible=level>.001}
  const filling=controller.connected&&state.rpm>.001&&state.direction===1&&path.stage==='carousel'&&path.phase>=CAROUSEL.fillStart&&path.phase<=CAROUSEL.fillEnd
  if(jet.current){const bottom=.012+level*.2;jet.current.visible=filling;jet.current.scale.y=.3-bottom;jet.current.position.y=(.3+bottom)/2}
 })
 return <group ref={bottle}>
  <mesh geometry={geometry} dispose={null} material={m.bottle} castShadow/>
  <mesh ref={liquid} material={m.liquid}><cylinderGeometry args={[.044,.044,.2,32]}/></mesh>
  <mesh position={[0,.095,0]} material={m.bottleLabel}><cylinderGeometry args={[.0504,.0504,.055,32,1,true]}/></mesh>
  <mesh ref={jet} material={m.cyan}><cylinderGeometry args={[.0025,.0025,1,8]}/></mesh>
 </group>
}
export function Cable({points,m,material,radius=.005}:{points:[number,number,number][];m?:CarouselMaterials;material?:import('three').Material;radius?:number}){
 const curve=useMemo(()=>new CatmullRomCurve3(points.map(p=>new Vector3(...p))),[points])
 return <mesh material={material||m!.rubber}><tubeGeometry args={[curve,80,radius,8,false]}/></mesh>
}
