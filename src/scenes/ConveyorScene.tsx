import { FeedbackEncoders } from './conveyor/FeedbackEncoders'
import type { ConveyorSensor } from '../conveyor/feedback'
import { ControlEnclosure } from './conveyor/ControlEnclosure'
import type { CarouselController, ComparisonMode } from '../carousel/controller'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CatmullRomCurve3, Vector3 } from 'three'
import type { Group } from 'three'
import { buildEncoderExterior } from './encoder/model'
import { beltTexture, buildBeltGeometry, DRIVE_X, ENCODER_POSITION, mountingPlate } from '../conveyor/geometry'
import { buildConveyorMaterials } from '../conveyor/materials'
import type { ConveyorMaterials } from '../conveyor/materials'
import { CONVEYOR } from '../conveyor/simulation'
import type { CraneSensor } from '../crane/drawWire'
import type { CraneController } from '../crane/controller'
import type { ConveyorController } from '../conveyor/controller'
import { AxialCylinder, Bolt, GearMotor, MetalBox, SideFrame } from './conveyor/Hardware'
import { Parcel } from './conveyor/Parcel'
import { Workshop } from './conveyor/Workshop'
export interface MachineSceneProps { conveyorSensor?:ConveyorSensor;onConveyorSensorSelect?:(sensor:ConveyorSensor)=>void; conveyor?:ConveyorController;carousel?:CarouselController;carouselPower?:boolean;carouselSignal?:boolean;carouselExploded?:boolean;carouselCutaway?:boolean;carouselComparison?:ComparisonMode;carouselConnected?:boolean; crane?:CraneController;craneSensor?:CraneSensor;allSensors?:boolean;internalMechanism?:boolean;onCraneSensorSelect?:(sensor:CraneSensor)=>void; selected?:boolean; cutaway?:boolean; onSensorSelect?:()=>void }
function Roller({x,rotorRef,materials:m}:{x:number;rotorRef:RefObject<Group|null>;materials:ConveyorMaterials}) {
 return <group position={[x,CONVEYOR.shaftHeight,0]}>
  <group ref={rotorRef}>
   <AxialCylinder radius={CONVEYOR.rollerRadius} depth={.96} material={m.aluminium}/>
   <AxialCylinder radius={.015} depth={x>0?1.6:1.18} material={m.steel}/>
   {[-.487,.487].map(z=><group key={z}>
    <AxialCylinder position={[0,0,z]} radius={.148} depth={.016} material={m.steel}/>
    {[.035,.105,.141].map(radius=><mesh key={radius} position={[0,0,z+Math.sign(z)*.009]} material={m.aluminium}><torusGeometry args={[radius,.0007,6,64]}/></mesh>)}
    <MetalBox position={[0,.112,z+Math.sign(z)*.01]} size={[.006,.037,.0015]} material={m.recess} radius={.0004}/>
   </group>)}
  </group>
  {[-.56,.56].map(z=><group key={z}>
   <MetalBox position={[0,-.05,z]} size={[.18,.13,.085]} material={m.bearing} radius={.013}/>
   <MetalBox position={[0,-.106,z]} size={[.245,.024,.105]} material={m.bearing} radius={.006}/>
   <AxialCylinder position={[0,0,z]} radius={.052} depth={.088} material={m.bearing}/>
   <AxialCylinder position={[0,0,z+Math.sign(z)*.051]} radius={.033} depth={.012} material={m.steel}/>
   <mesh position={[0,0,z+Math.sign(z)*.058]} material={m.recess}><torusGeometry args={[.021,.003,8,40]}/></mesh>
   {[-.091,.091].map(dx=><Bolt key={dx} position={[dx,-.088,z]} rotation={[-Math.PI/2,0,0]} material={m.steel} radius={.011}/>)}
   <mesh position={[0,.054,z]} material={m.steel} castShadow><cylinderGeometry args={[.005,.007,.018,6]}/></mesh>
  </group>)}
 </group>
}
export function ConveyorScene({conveyor,selected=false,cutaway=false,onSensorSelect,conveyorSensor='shaft',onConveyorSensorSelect}:MachineSceneProps) {
 if(!conveyor)throw new Error('Conveyor scene requires its motion controller')
 return <OperatingConveyor controller={conveyor} selected={selected} cutaway={cutaway} onSensorSelect={onSensorSelect} conveyorSensor={conveyorSensor} onConveyorSensorSelect={onConveyorSensorSelect}/>
}
function OperatingConveyor({controller,selected,cutaway,onSensorSelect,conveyorSensor,onConveyorSensorSelect}:{conveyorSensor:ConveyorSensor;onConveyorSensorSelect?:(sensor:ConveyorSensor)=>void;controller:ConveyorController;selected:boolean;cutaway:boolean;onSensorSelect?:()=>void}) {
 const drive=useRef<Group>(null),idler=useRef<Group>(null),coupling=useRef<Group>(null)
 const materials=useMemo(buildConveyorMaterials,[])
 const resources=useMemo(()=>({belt:buildBeltGeometry(),texture:beltTexture(),encoder:buildEncoderExterior(),mount:mountingPlate(),cable:new CatmullRomCurve3([new Vector3(1.851,1.05,.964),new Vector3(1.89,1.05,.99),new Vector3(1.96,.97,.96),new Vector3(1.92,.83,.65),new Vector3(1.2,.78,.58),new Vector3(.5,.78,.58)])}),[])
 const {invalidate}=useThree()
 useEffect(()=>controller.subscribe(invalidate),[controller,invalidate])
 useEffect(()=>{resources.encoder.cutaway(cutaway&&conveyorSensor==='shaft');invalidate()},[cutaway,conveyorSensor,resources,invalidate])
 useEffect(()=>()=>{resources.belt.dispose();resources.texture.dispose();resources.mount.dispose();resources.encoder.dispose();materials.dispose()},[resources,materials])
 useFrame((_,dt)=>{
  if(!document.hidden)controller.tick(Math.min(dt,.05))
  const state=controller.motion
  if(drive.current)drive.current.rotation.z=-state.shaftRadians
  if(idler.current)idler.current.rotation.z=-state.beltTravel/CONVEYOR.rollerRadius
  if(coupling.current)coupling.current.rotation.z=-state.shaftRadians
  resources.encoder.rotor.rotation.z=state.shaftRadians
  resources.texture.offset.x=-state.beltTravel/.36
  if((controller.demo.active&&!controller.demo.paused)||Math.abs(state.rpm)>1e-9||(state.running&&state.targetRPM>0))invalidate()
 })
 return <group>
  <Workshop materials={materials}/>
  <SideFrame materials={materials}/><ControlEnclosure m={materials}/>
  <Roller x={DRIVE_X} rotorRef={drive} materials={materials}/><Roller x={-DRIVE_X} rotorRef={idler} materials={materials}/>
  <mesh geometry={resources.belt} castShadow receiveShadow><meshStandardMaterial map={resources.texture} bumpMap={resources.texture} bumpScale={.00025} roughness={.91} metalness={0}/></mesh>
  <GearMotor materials={materials} cutaway={cutaway&&conveyorSensor==='motor'}/><FeedbackEncoders controller={controller} m={materials} focus={conveyorSensor} cutaway={cutaway} onSelect={onConveyorSensorSelect}/>
  <group ref={coupling} position={[DRIVE_X,1.05,0]}>
   <AxialCylinder position={[0,0,.845]} radius={.005} depth={.09} material={materials.steel}/>
   {[.877,.913].map(z=><group key={z}><AxialCylinder position={[0,0,z]} radius={.014} depth={.014} material={materials.aluminium}/><MetalBox position={[0,.014,z]} size={[.004,.001,.005]} material={materials.recess} radius={.0002}/></group>)}
   <AxialCylinder position={[0,0,.895]} radius={.011} depth={.027} material={materials.steel}/>
   {[.886,.89,.894,.898,.902,.906].map(z=><mesh key={z} position={[0,0,z]} material={materials.steel}><torusGeometry args={[.0125,.0012,8,40]}/></mesh>)}
   <MetalBox position={[0,.0145,.877]} size={[.002,.001,.007]} material={materials.steel} radius={.0002}/>
  </group>
  <MetalBox position={[DRIVE_X,.966,.745]} size={[.12,.008,.39]} material={materials.steel} radius={.0015}/>
  <mesh position={[DRIVE_X,1.05,.93575]} geometry={resources.mount} material={materials.steel} castShadow receiveShadow/>
  {[-.036,.036].map(dx=><Bolt key={dx} position={[DRIVE_X+dx,.977,.59]} rotation={[-Math.PI/2,0,0]} material={materials.steel} radius={.007}/>)}
  <primitive onClick={(event:{stopPropagation:()=>void})=>{event.stopPropagation();onConveyorSensorSelect?onConveyorSensorSelect('shaft'):onSensorSelect?.()}} object={resources.encoder.root} position={ENCODER_POSITION} rotation={[0,Math.PI,0]} scale={.001} dispose={null}/>
  <mesh material={materials.rubber}><tubeGeometry args={[resources.cable,80,.004,10,false]}/></mesh>
  {[.7,1.1,1.5].map(x=><MetalBox key={x} position={[x,.782,.58]} size={[.018,.018,.012]} material={materials.steel} radius={.002}/>)}
  {selected&&conveyorSensor==='shaft'&&<mesh position={[DRIVE_X,1.05,.942]}><torusGeometry args={[.032,.0009,8,64]}/><meshBasicMaterial color="#f18545" transparent opacity={.8}/></mesh>}
  {[0,1,2].map(index=><Parcel index={index} controller={controller} materials={materials} key={index}/>)}
 </group>
}
