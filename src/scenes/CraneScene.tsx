import type { CraneSensor } from '../crane/drawWire'
import { DrawWireSensor, DrawWireAnchor } from './crane/DrawWire'
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { CatmullRomCurve3, Quaternion, Vector3 } from 'three'
import type { Group, Mesh } from 'three'
import type { MachineSceneProps } from './ConveyorScene'
import type { CraneController } from '../crane/controller'
import { boomPointToWorld, boomTipLocal, CRANE, cylinderGeometry, innerSectionX, middleSectionX, sensorWorldPosition } from '../crane/kinematics'
import { buildCraneMaterials } from './crane/materials'
import type { CraneMaterials } from './crane/materials'
import { Chassis } from './crane/Chassis'
import { BaseBoom, InnerBoom, MiddleBoom } from './crane/Boom'
import { UpperStructure } from './crane/UpperStructure'
import { AxialCylinder, MetalBox } from './conveyor/Hardware'
import { Workshop } from './conveyor/Workshop'
const UP=new Vector3(0,1,0)
function HydraulicCylinder({controller,z,m}:{controller:CraneController;z:number;m:CraneMaterials}){
 const assembly=useRef<Group>(null),rod=useRef<Mesh>(null),eye=useRef<Group>(null)
 const direction=useMemo(()=>new Vector3(),[]),quaternion=useMemo(()=>new Quaternion(),[])
 useFrame(()=>{if(!assembly.current||!rod.current||!eye.current)return;const geometry=cylinderGeometry(controller.motion,z);assembly.current.position.set(...geometry.lower);direction.set(...geometry.upper).sub(assembly.current.position).normalize();quaternion.setFromUnitVectors(UP,direction);assembly.current.quaternion.copy(quaternion);const length=geometry.length;rod.current.position.y=(1.9+length-.08)/2;rod.current.scale.y=length-.08-1.9;eye.current.position.y=length})
 return <group ref={assembly}>
  <AxialCylinder radius={.12} depth={.23} material={m.steel}/>
  <mesh position={[0,1.06,0]} material={m.yellow} castShadow><cylinderGeometry args={[.118,.118,1.98,40]}/></mesh>
  {[.15,1.94,2.04].map(y=><mesh key={y} position={[0,y,0]} material={y===2.04?m.dark:m.steel} castShadow><cylinderGeometry args={[.127,.127,.07,40]}/></mesh>)}
  <mesh ref={rod} material={m.steel} castShadow><cylinderGeometry args={[.072,.072,1,40]}/></mesh>
  <group ref={eye}><AxialCylinder radius={.115} depth={.2} material={m.dark}/><AxialCylinder radius={.048} depth={.245} material={m.steel}/></group>
  <MetalBox position={[.12,.3,0]} size={[.04,.15,.06]} material={m.dark} radius={.012}/>
 </group>
}
function Hoist({controller,m}:{controller:CraneController;m:CraneMaterials}){
 const hook=useRef<Group>(null),rope=useRef<Mesh>(null),alongBoom=useRef<Mesh>(null),feed=useRef<Mesh>(null)
 const line=useMemo(()=>new Vector3(),[])
 const hookCurve=useMemo(()=>new CatmullRomCurve3([new Vector3(0,-.22,0),new Vector3(-.07,-.31,0),new Vector3(-.13,-.43,0),new Vector3(-.06,-.52,0),new Vector3(.07,-.5,0),new Vector3(.12,-.4,0)]),[])
 useFrame(()=>{
  const state=controller.motion,tip=boomPointToWorld(boomTipLocal(state),state),start=boomPointToWorld([.08,.35,0],state)
  const sheaveTop=boomPointToWorld([boomTipLocal(state)[0],.06,0],state)
  if(hook.current)hook.current.position.set(tip[0]+.16,tip[1]-1.15,tip[2])
  if(rope.current){rope.current.position.set(tip[0]+.16,tip[1]-.575,tip[2]);rope.current.scale.y=1.15}
  if(feed.current){const a=new Vector3(-1.9,2.38,.1),b=new Vector3(...start);feed.current.position.copy(a).add(b).multiplyScalar(.5);line.copy(b).sub(a);feed.current.scale.y=line.length();feed.current.quaternion.setFromUnitVectors(UP,line.normalize())}
  if(alongBoom.current){const a=new Vector3(...start),b=new Vector3(...sheaveTop);alongBoom.current.position.copy(a).add(b).multiplyScalar(.5);line.copy(b).sub(a);alongBoom.current.scale.y=line.length();alongBoom.current.quaternion.setFromUnitVectors(UP,line.normalize())}
 })
 return <group>
  <mesh ref={feed} material={m.steel}><cylinderGeometry args={[.007,.007,1,10]}/></mesh>
  <mesh ref={alongBoom} material={m.steel}><cylinderGeometry args={[.007,.007,1,10]}/></mesh>
  <mesh ref={rope} material={m.steel} castShadow><cylinderGeometry args={[.008,.008,1,12]}/></mesh>
  <group ref={hook}><MetalBox position={[0,-.09,0]} size={[.25,.29,.22]} material={m.yellow} radius={.035}/>{[-.12,.12].map(z=><group key={z}><AxialCylinder position={[0,-.04,z]} radius={.103} depth={.025} material={m.dark}/><AxialCylinder position={[0,-.04,z*1.15]} radius={.032} depth={.025} material={m.steel}/></group>)}<mesh material={m.steel} castShadow><tubeGeometry args={[hookCurve,32,.035,12,false]}/></mesh><MetalBox position={[.05,-.36,0]} size={[.022,.18,.026]} rotation={[0,0,-.56]} material={m.dark}/></group>
 </group>
}
function AngleReference({controller}:{controller:CraneController}){
 const {motion,principle}=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot)
 const position=sensorWorldPosition(motion),a=motion.boomAngleDegrees*Math.PI/180
 const arc=Array.from({length:33},(_,i)=>[Math.cos(a*i/32)*.11,Math.sin(a*i/32)*.11,.045] as [number,number,number])
 return <group position={position}>
  <Line points={[[0,0,.04],[.29,0,.04]]} color="#d3ebed" lineWidth={1.2} dashed dashSize={.04} gapSize={.025}/>
  <Line points={[[0,0,.04],[Math.cos(a)*.25,Math.sin(a)*.25,.04]]} color="#ff9b4c" lineWidth={2}/>
  <Line points={arc} color="#ff9b4c" lineWidth={2}/>
  {principle&&<><Line points={[[0,0,.04],[0,-.2,.04],[-.025,-.16,.04],[0,-.2,.04],[.025,-.16,.04]]} color="#98d4de" lineWidth={2}/><Html position={[-.08,-.25,.05]} center><span className="crane-world-label gravity-label">GRAVITY ↓</span></Html></>}
  <Html position={[.15,.2,.06]} center><span className="crane-world-label">{motion.boomAngleDegrees.toFixed(1)}°<small>ABOVE HORIZONTAL</small></span></Html>
 </group>
}
export function CraneScene({crane,selected=false,onSensorSelect,craneSensor='inclinometer',allSensors=false,internalMechanism=false,onCraneSensorSelect}:MachineSceneProps){
 if(!crane)throw new Error('Crane scene requires its motion controller')
 return <OperatingCrane controller={crane} selected={selected} onSelect={onSensorSelect} sensor={craneSensor} allSensors={allSensors} internal={internalMechanism} onSensorSelect={onCraneSensorSelect}/>
}
function OperatingCrane({controller,selected,onSelect,sensor,allSensors,internal,onSensorSelect}:{controller:CraneController;selected:boolean;onSelect?:()=>void;sensor:CraneSensor;allSensors:boolean;internal:boolean;onSensorSelect?:(sensor:CraneSensor)=>void}){
 const m=useMemo(buildCraneMaterials,[]),boom=useRef<Group>(null),middle=useRef<Group>(null),inner=useRef<Group>(null),upper=useRef<Group>(null)
 const {invalidate}=useThree()
 useEffect(()=>controller.subscribe(invalidate),[controller,invalidate])
 useEffect(()=>()=>m.dispose(),[m])
 useFrame((_,dt)=>{
  if(!document.hidden)controller.tick(Math.min(dt,.05))
  if(boom.current)boom.current.rotation.z=controller.motion.boomAngleDegrees*Math.PI/180
  if(middle.current)middle.current.position.x=middleSectionX(controller.motion.boomExtensionMeters)
  if(inner.current)inner.current.position.x=innerSectionX(controller.motion.boomExtensionMeters)-middleSectionX(controller.motion.boomExtensionMeters)
  if(upper.current)upper.current.rotation.y=controller.motion.slewDegrees*Math.PI/180
  if(controller.moving)invalidate()
 },-1)
 return <group>
  <group scale={[2,1,2]}><Workshop materials={m}/></group>
  <Chassis materials={m}/>
  <group ref={upper}>
   <UpperStructure m={m}/>
   <group position={CRANE.pivot} ref={boom}>
    <BaseBoom m={m} selected={(selected&&sensor==='inclinometer')||allSensors} onSelect={()=>onSensorSelect?onSensorSelect('inclinometer'):onSelect?.()}/>
    <DrawWireSensor controller={controller} m={m} selected={(selected&&sensor==='draw-wire')||allSensors} internal={internal} onSelect={()=>onSensorSelect?.('draw-wire')}/>
    <group ref={middle}><MiddleBoom m={m}/><group ref={inner}><InnerBoom m={m}/><DrawWireAnchor m={m}/></group></group>
   </group>
  </group>
  {[-.24,.24].map(z=><HydraulicCylinder key={z} z={z} controller={controller} m={m}/>)}
  <Hoist controller={controller} m={m}/>
  {selected&&sensor==='inclinometer'&&<AngleReference controller={controller}/>}
 </group>
}
