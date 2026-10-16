import { axialSector } from '../encoder/section'
import { directCablePoints } from '../../carousel/comparison'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, ExtrudeGeometry, Path, Shape, Mesh as ThreeMesh, MeshStandardMaterial, Vector3 } from 'three'
import type { Group, Mesh } from 'three'
import type { CarouselController } from '../../carousel/controller'
import { STATOR_POWER, STATOR_SIGNAL, ROTOR_POWER, ROTOR_SIGNAL, POWER_LEVELS, SIGNAL_LEVELS, TRACK_RADIUS } from '../../carousel/electrical'
import { AxialCylinder, Bolt, MetalBox } from '../conveyor/Hardware'
import { Ring } from './Hardware'
import { Cable } from './Machine'
import type { CarouselMaterials } from './materials'
import type { Vec3 } from '../../config/applications'
export function TransmissionTrace({points,color,controller,enabled,active=true,traceScale=1}:{points:Vec3[];color:string;controller:CarouselController;enabled:boolean;active?:boolean;traceScale?:number}){
 const curve=useMemo(()=>new CatmullRomCurve3(points.map(p=>new Vector3(...p))),[points]),dots=useRef<(Mesh|null)[]>([])
 useFrame(()=>{dots.current.forEach((dot,i)=>{if(!dot)return;dot.visible=enabled&&active;dot.position.copy(curve.getPointAt((controller.motion.elapsed*.32+i*.33)%1))})})
 if(!enabled)return null
 return <group><mesh><tubeGeometry args={[curve,96,.0018*traceScale,6,false]}/><meshBasicMaterial color={color} transparent opacity={active?.8:.22} depthTest={false}/></mesh>{[0,1,2].map(i=><mesh key={i} ref={node=>{dots.current[i]=node}}><sphereGeometry args={[.004*traceScale,12,8]}/><meshBasicMaterial color={color} depthTest={false}/></mesh>)}</group>
}
export function SlipRing({controller,m,power,signal,exploded,comparison,onSelect,connected,cutaway=false}:{cutaway?:boolean;controller:CarouselController;m:CarouselMaterials;inspect:boolean;power:boolean;signal:boolean;exploded:boolean;comparison:boolean;onSelect:()=>void;connected:boolean}){
 const geometry=useMemo(()=>{
  const s=new Shape();s.absarc(0,0,.0425,0,Math.PI*2,false);const bore=new Path();bore.absarc(0,0,.0152,0,Math.PI*2,true);s.holes.push(bore)
  for(let i=0;i<8;i++){const a=i*Math.PI/4,h=new Path();h.absarc(Math.cos(a)*.034,Math.sin(a)*.034,.003,0,Math.PI*2,true);s.holes.push(h)}
  const flange=new ExtrudeGeometry(s,{depth:.008,bevelEnabled:false,curveSegments:48});flange.rotateX(-Math.PI/2);flange.translate(0,-.004,0)
  return {flange,window:axialSector(.0425,.035,.145)}
 },[])
 useEffect(()=>()=>Object.values(geometry).forEach(g=>g.dispose()),[geometry])
 const fixedClamp=useRef<Group>(null),rotor=useRef<Group>(null),brushes=useRef<Group>(null),cover=useRef<Group>(null),cap=useRef<Group>(null),stationaryLead=useRef<Mesh>(null)
 const bypass=useMemo(()=>{
  const geometry=new BufferGeometry(),indices:number[]=[]
  geometry.setAttribute('position',new BufferAttribute(new Float32Array(129*9*3),3))
  geometry.setAttribute('normal',new BufferAttribute(new Float32Array(129*9*3),3))
  for(let i=0;i<128;i++)for(let j=0;j<8;j++){const a=i*9+j,b=a+9;indices.push(a,a+1,b,b,a+1,b+1)}
  geometry.setIndex(indices)
  return new ThreeMesh(geometry,new MeshStandardMaterial({color:'#e8a25d',roughness:.5,metalness:.08}))
 },[])
 useEffect(()=>()=>{bypass.geometry.dispose();(bypass.material as MeshStandardMaterial).dispose()},[bypass])
 useFrame(()=>{
  const e=controller.explosion
  if(rotor.current)rotor.current.rotation.y=controller.motion.angleRadians
  if(brushes.current)brushes.current.position.x=e*.14
  if(cover.current){cover.current.position.z=-e*.16;cover.current.position.y=e*.1}
  if(cap.current)cap.current.position.y=e*.13
  if(stationaryLead.current){stationaryLead.current.position.x=.049+e*.07;stationaryLead.current.scale.x=.038+e*.14}
  if(controller.directReference!==null){
   const p=bypass.geometry.attributes.position,n=bypass.geometry.attributes.normal,reference=controller.directReference,twist=controller.motion.angleRadians-reference
   const points=directCablePoints(twist,reference),tangent=new Vector3(),normal=new Vector3(),binormal=new Vector3(),axis=new Vector3(1,0,0)
   points.forEach((v,i)=>{
    const before=points[Math.max(0,i-1)],after=points[Math.min(128,i+1)]
    tangent.set(after[0]-before[0],after[1]-before[1],after[2]-before[2]).normalize();normal.crossVectors(tangent,axis).normalize();binormal.crossVectors(tangent,normal)
    for(let j=0;j<=8;j++){const a=j*Math.PI/4,x=normal.x*Math.cos(a)+binormal.x*Math.sin(a),y=normal.y*Math.cos(a)+binormal.y*Math.sin(a),z=normal.z*Math.cos(a)+binormal.z*Math.sin(a);p.setXYZ(i*9+j,v[0]+x*.004,v[1]+y*.004,v[2]+z*.004);n.setXYZ(i*9+j,x,y,z)}
   })
   if(fixedClamp.current)fixedClamp.current.rotation.y=reference;p.needsUpdate=true;n.needsUpdate=true;bypass.geometry.computeBoundingSphere()
  }
 })
 const transparent=cutaway||exploded
 return <group>
  {/* Hollow rotating shaft extension: output cables stay inside it when crossing the fixed stator support height. */}
  <group ref={rotor}>
   <Ring position={[0,1.815,0]} outer={.015} inner={.008} height={.39} material={transparent?m.sensorGhost:m.sensorSteel}/>
   {!comparison&&<>
    <Ring position={[0,1.738,0]} outer={.026} inner={.015} height={.025} material={m.sensorSteel}/>
    {[0,Math.PI/2,Math.PI,Math.PI*1.5].map(a=><Bolt key={a} position={[Math.cos(a)*.026,1.738,-Math.sin(a)*.026]} rotation={[0,Math.PI/2+a,0]} radius={.003} material={m.sensorSteel}/>)}
    <Ring position={[0,1.845,0]} outer={.027} inner={.015} height={.125} material={m.sensorBlack}/>
    {POWER_LEVELS.map(y=><Ring key={y} position={[0,y,0]} outer={TRACK_RADIUS} inner={.026} height={.009} material={m.contact}/>)}
    {SIGNAL_LEVELS.map(y=><Ring key={y} position={[0,y,0]} outer={TRACK_RADIUS} inner={.026} height={.006} material={m.signalContact}/>)}
    <group ref={cap}><Ring position={[0,1.928,0]} outer={.0425} inner={.015} height={.035} material={transparent?m.sensorGhost:m.sensorBlack}/></group><MetalBox position={[.027,1.946,0]} size={[.018,.012,.022]} material={m.sensorBlack}/><Bolt position={[-.03,1.946,0]} rotation={[-Math.PI/2,0,0]} radius={.003} material={m.sensorSteel}/>
    <Cable points={ROTOR_POWER} m={m} radius={.003}/><Cable points={ROTOR_SIGNAL} m={m} radius={.0025}/>
    <TransmissionTrace points={ROTOR_POWER} color="#ffbb70" controller={controller} enabled={power} active={connected}/><TransmissionTrace points={ROTOR_SIGNAL} color="#80d9ef" controller={controller} enabled={signal} active={connected}/>
   </>}
   {comparison&&<><MetalBox position={[.038,1.72,0]} size={[.075,.014,.02]} material={m.sensorSteel}/><MetalBox position={[.075,1.72,0]} size={[.024,.025,.025]} material={m.sensorBlack}/></>}
  </group>
  {!comparison&&<>
   <mesh position={[0,1.76,0]} geometry={geometry.flange} material={m.sensorSteel} castShadow/>
   <MetalBox position={[0,1.765,-.068]} size={[.025,.012,.05]} material={m.sensorSteel}/><Bolt position={[0,1.777,-.081]} rotation={[-Math.PI/2,0,0]} radius={.004} material={m.sensorSteel}/>
   <group ref={cover} onClick={event=>{event.stopPropagation();onSelect()}}>
    {cutaway&&!exploded?<mesh position={[0,1.844,0]} rotation={[Math.PI/2,0,0]} geometry={geometry.window} material={m.sensorRed} castShadow/>:<Ring position={[0,1.844,0]} outer={.0425} inner={.035} height={.145} material={m.sensorRed}/>}
    {[1.784,1.904].map(y=><Ring key={y} position={[0,y,0]} outer={.043} inner={.035} height={.002} material={exploded?m.sensorRed:transparent?m.clearRed:m.sensorRed}/>)}
    {!transparent&&<><MetalBox position={[0,1.84,.043]} size={[.031,.055,.001]} material={m.sensorLabel} radius={.001}/>{[-.016,.016].map(x=><MetalBox key={x} position={[x,1.84,.0435]} size={[.0012,.055,.0004]} material={m.sensorRed}/>)}</>}
    {Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;if(cutaway&&Math.cos(a)>0&&Math.sin(a)>0)return null;return <MetalBox key={i} position={[Math.cos(a)*.042,1.844,Math.sin(a)*.042]} size={[.002,.112,.002]} material={m.sensorRed} radius={.0005}/>})}
   </group>
   {!transparent&&<group><MetalBox position={[.038,1.79,-.012]} size={[.034,.027,.028]} material={m.sensorBlack} radius={.002}/>{[-.019,-.005].map(z=><Bolt key={z} position={[.055,1.80,z]} radius={.0025} rotation={[0,Math.PI/2,0]} material={m.sensorSteel}/>)}</group>}
   <group ref={brushes}>
    <MetalBox position={[.046,1.844,0]} size={[.018,.117,.026]} material={m.sensorBlack} radius={.003}/>
    {[...POWER_LEVELS,...SIGNAL_LEVELS].map((y,i)=><group key={y}><MetalBox position={[.035, y,0]} size={[.012,.006,.011]} material={i<2?m.contact:m.signalContact} radius={.001}/><Bolt position={[.053,y,0]} rotation={[0,Math.PI/2,0]} radius={.0025} material={m.sensorSteel}/></group>)}
   </group>
   <mesh ref={stationaryLead} position={[.049,1.815,0]}><boxGeometry args={[1,.003,.003]}/><meshStandardMaterial color="#5f5041"/></mesh>
   <Cable points={STATOR_POWER} m={m} radius={.004}/><Cable points={STATOR_SIGNAL} m={m} radius={.003}/>
   <TransmissionTrace points={STATOR_POWER} color="#ffbb70" controller={controller} enabled={power} active={connected}/><TransmissionTrace points={STATOR_SIGNAL} color="#80d9ef" controller={controller} enabled={signal} active={connected}/>
   {(power||signal)&&[...POWER_LEVELS.map(y=>({y,color:'#ffbb70',show:power})),...SIGNAL_LEVELS.map(y=>({y,color:'#80d9ef',show:signal}))].map(({y,color,show})=>show&&<mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.0303,.001,8,96]}/><meshBasicMaterial color={color} transparent opacity={connected?.95:.2}/></mesh>)}
  </>}
  {comparison&&<><MetalBox position={[0,1.995,-1.52]} size={[.07,.15,.07]} material={m.stainless}/><MetalBox position={[0,2.05,-.76]} size={[.035,.035,1.52]} material={m.stainless}/><group ref={fixedClamp}><MetalBox position={[.038,2.05,0]} size={[.075,.025,.025]} material={m.sensorSteel}/><MetalBox position={[.075,2.035,0]} size={[.025,.03,.026]} material={m.sensorBlack}/></group><primitive object={bypass}/><Html position={[.11,2.03,.06]} center><span className="carousel-world-label">DIRECT CABLE<small>±90° DEMONSTRATION LIMIT</small></span></Html></>}
 </group>
}
