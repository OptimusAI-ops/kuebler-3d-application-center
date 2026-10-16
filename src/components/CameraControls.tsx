import { conveyorSensors } from '../conveyor/feedback'
import type { ConveyorSensor } from '../conveyor/feedback'
import type { CarouselController } from '../carousel/controller'
import type { CraneSensor } from '../crane/drawWire'
import { drawWireWorldPosition } from '../crane/drawWire'
import type { CraneController } from '../crane/controller'
import { boomPointToWorld, sensorWorldPosition, boomTipLocal } from '../crane/kinematics'
import { useEffect, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { ApplicationConfig } from '../config/applications'
export type CameraView = 'overview' | 'sensor' | 'side' | 'isometric'
export interface CameraRequest { view: CameraView; revision: number; sensor?:CraneSensor;conveyorSensor?:ConveyorSensor }
interface Waypoint { position:Vector3;target:Vector3 }
const ease=(t:number)=>t*t*t*(t*(t*6-15)+10)
export function CameraRig({ app, request, crane, carousel, inspectionExpanded=false }: { app: ApplicationConfig; request: CameraRequest;crane?:CraneController;carousel?:CarouselController;inspectionExpanded?:boolean }) {
 const controls=useRef<OrbitControlsImpl>(null),path=useRef<Waypoint[]>([]),flight=useRef<{from:Vector3;target:Vector3;elapsed:number;duration:number}|null>(null)
 const {invalidate,camera,size}=useThree()
 const lastSensor=useRef<Vector3|null>(null),manualOrbit=useRef(false)
 const sensorPosition=()=>new Vector3(...(crane?((request.sensor||(app.id==='boom-angle'?'inclinometer':'draw-wire'))==='inclinometer'?sensorWorldPosition(crane.motion):drawWireWorldPosition(crane.motion)):app.machine==='conveyor'?conveyorSensors[request.conveyorSensor||'shaft'].target:(app.sensorTarget||app.sensor)))
 const craneFrame=(view:CameraView)=>{
  const tip=crane?boomPointToWorld(boomTipLocal(crane.motion),crane.motion):[0,6.6,0]
  const target=new Vector3((Math.max(4.2,tip[0])-4.2)/2,Math.max(2.6,tip[1]/2),0)
  const base=new Vector3(...(view==='side'?(app.side||[.8,4.9,21]):view==='isometric'?(app.isometric||[-11,10,14]):(app.overview||[11,8,14])))
  const position=base.sub(new Vector3(.5,3.3,0)).multiplyScalar(Math.max(1,(tip[1]+1)/9.5,(Math.max(4.2,tip[0])+4.4)/11)).add(target)
  if(size.width<size.height)position.sub(target).multiplyScalar(size.height/size.width*1.05).add(target)
  return {position,target}
 }
 useEffect(()=>{
  manualOrbit.current=false
  const presets={overview:app.overview||[7,5.2,7],isometric:app.isometric||[-6,5.5,7],side:app.side||[0,3,8],sensor:app.focus}
  const framing=crane&&request.view!=='sensor'?craneFrame(request.view):null
  const target=request.view==='sensor'?sensorPosition():framing?.target||new Vector3(...(app.machineTarget||[0,1,0]))
  lastSensor.current=request.view==='sensor'&&crane?target.clone():null
  const steps:Waypoint[]=[]
  const oldTarget=controls.current?.target.clone()||new Vector3(0,1,0)
  // Leave any close-up along its outward viewing ray before crossing the machine envelope.
  if(camera.position.distanceTo(oldTarget)<3&&request.view!=='sensor') steps.push({position:oldTarget.clone().add(camera.position.clone().sub(oldTarget).normalize().multiplyScalar(5)),target:oldTarget})
  // Approach the encoder from above and outside the frame, never through the conveyor.
  if(request.view==='sensor'&&app.machine==='conveyor') steps.push({position:target.clone().add(new Vector3(1.5,2,request.conveyorSensor==='motor'?-2:2)),target})
  if(request.view==='sensor'&&crane)steps.push({position:target.clone().add(new Vector3(2.5,2.5,3.5)),target:target.clone()})
  const destination=request.view==='sensor'&&app.machine==='conveyor'?target.clone().add((inspectionExpanded&&request.conveyorSensor==='shaft'?new Vector3(.10,.09,.30):new Vector3(...conveyorSensors[request.conveyorSensor||'shaft'].offset)).multiplyScalar(inspectionExpanded&&request.conveyorSensor!=='motor'?.7:1)):request.view==='sensor'&&carousel?target.clone().add(new Vector3(...(inspectionExpanded?[.38,.3,.6] as [number,number,number]:[.18,.13,.3] as [number,number,number]))):request.view==='sensor'&&crane?target.clone().add(new Vector3(.16,.12,request.sensor==='draw-wire'?.48:.42)):framing?.position||new Vector3(...presets[request.view])
  if((app.machine==='conveyor'||app.machine==='carousel')&&request.view!=='sensor'&&size.width<size.height)destination.sub(target).multiplyScalar(size.height/size.width*1.05).add(target)
  steps.push({position:destination,target})
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){const last=steps[steps.length-1];camera.position.copy(last.position);controls.current?.target.copy(last.target);controls.current?.update();path.current=[]}
  else path.current=steps
  flight.current=null
  invalidate()
 },[request,app.machine,camera,invalidate,size.width,size.height,crane,carousel,inspectionExpanded])
 useFrame((_,dt)=>{
  if(crane&&request.view==='sensor'&&lastSensor.current&&controls.current){const current=sensorPosition(),delta=current.clone().sub(lastSensor.current);camera.position.add(delta);controls.current.target.add(delta);path.current.forEach(p=>{p.position.add(delta);p.target.add(delta)});if(flight.current){flight.current.from.add(delta);flight.current.target.add(delta)}lastSensor.current.copy(current);controls.current.update()}
  const point=path.current[0]
  if(!controls.current)return
  if(!point){
   if(crane&&request.view!=='sensor'&&!manualOrbit.current){const fit=craneFrame(request.view),blend=1-Math.exp(-Math.min(dt,.05)*3);camera.position.lerp(fit.position,blend);controls.current.target.lerp(fit.target,blend);controls.current.update();if(camera.position.distanceTo(fit.position)>.01)invalidate()}
   return
  }
  if(!flight.current)flight.current={from:camera.position.clone(),target:controls.current.target.clone(),elapsed:0,duration:path.current.length>1?.7:1.15}
  const f=flight.current;f.elapsed+=Math.min(dt,.05);const t=Math.min(1,f.elapsed/f.duration),blend=ease(t)
  camera.position.lerpVectors(f.from,point.position,blend);controls.current.target.lerpVectors(f.target,point.target,blend);controls.current.update()
  if(t>=1){path.current.shift();flight.current=null}
  if(path.current.length)invalidate()
 })
 return <OrbitControls ref={controls} makeDefault minDistance={request.view==='sensor'?(app.minSensorDistance||4):3.5} maxDistance={app.machine==='crane'?48:16} minPolarAngle={.15} maxPolarAngle={Math.PI/2-.06} enablePan={false} enableDamping onStart={()=>{path.current=[];flight.current=null;manualOrbit.current=true}}/>
}
