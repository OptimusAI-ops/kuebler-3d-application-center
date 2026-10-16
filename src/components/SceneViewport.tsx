import { conveyorSensors } from '../conveyor/feedback'
import type { ConveyorSensor } from '../conveyor/feedback'
import type { CarouselController, ComparisonMode } from '../carousel/controller'
import type { CraneSensor } from '../crane/drawWire'
import { drawWireWorldPosition } from '../crane/drawWire'
import type { CraneController } from '../crane/controller'
import { sensorWorldPosition } from '../crane/kinematics'
import { Component, memo, Suspense, useEffect, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Grid } from '@react-three/drei'
import { Crosshair, Move3D } from 'lucide-react'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import type { ConveyorController } from '../conveyor/controller'
import { PMREMGenerator, Vector3 } from 'three'
import type { ApplicationConfig } from '../config/applications'
import { sceneRegistry } from '../scenes/registry'
import { CameraRig } from './CameraControls'
import type { CameraRequest } from './CameraControls'
import { PhotographicEnvironment } from '../scenes/conveyor/Workshop'
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
 state = { failed: false }
 static getDerivedStateFromError() { return { failed: true } }
 render() { return this.state.failed ? <div className="scene-fallback"><Move3D size={32}/><h3>3D view unavailable</h3><p>This view needs a browser with WebGL 2 enabled.<br/>Product information and gallery navigation remain available.</p><button className="button" onClick={()=>window.location.reload()}>Retry 3D view</button></div> : this.props.children }
}
function SensorMarker({ app, buttonRef, crane, sensor, encoder, offset=0 }: { app: ApplicationConfig; selected: boolean; onSelect: ()=>void; buttonRef: RefObject<HTMLButtonElement|null>;crane?:CraneController;sensor?:CraneSensor;encoder?:ConveyorSensor;offset?:number }) {
 const projected = useRef(new Vector3()),otherProjected=useRef(new Vector3())
 useFrame(({camera,size})=>{
  if(!buttonRef.current) return
  const point=crane?(sensor==='inclinometer'?sensorWorldPosition(crane.motion):drawWireWorldPosition(crane.motion)):app.machine==='conveyor'?conveyorSensors[encoder||'shaft'].location:app.sensor
  projected.current.set(point[0],point[1]+(app.machine==='crane'?.12:app.machine==='conveyor'?.08:.11),point[2]).project(camera)
  const px=(projected.current.x*.5+.5)*size.width,py=(-projected.current.y*.5+.5)*size.height
  let lift=offset
  if(crane&&sensor==='inclinometer'&&offset>0){const other=drawWireWorldPosition(crane.motion);otherProjected.current.set(other[0],other[1]+.12,other[2]).project(camera);const ox=(otherProjected.current.x*.5+.5)*size.width,oy=(-otherProjected.current.y*.5+.5)*size.height;if(Math.abs(px-ox)<190&&Math.abs(py-lift-oy)<65)lift=Math.max(0,py-oy+65)}
  buttonRef.current.style.setProperty('--sensor-leader-height',`${lift}px`)
  buttonRef.current.style.transform=`translate(-50%, -100%) translate(${px}px, ${py-lift}px)`
  buttonRef.current.style.visibility=Math.abs(projected.current.z)<1?'visible':'hidden'
 })
 return null
}
function SceneViewportComponent({ app, selected, onSelect, camera, grid, conveyor, conveyorSensor='shaft',onConveyorSensorSelect,cutaway, crane, craneSensor, allSensors=false, internalMechanism=false, onCraneSensorSelect, carousel, carouselPower=false, carouselSignal=false, carouselExploded=false,carouselCutaway=false, carouselComparison=null, carouselConnected=true }: { app: ApplicationConfig; selected: boolean; onSelect: ()=>void; camera: CameraRequest; grid: boolean; conveyor?:ConveyorController;conveyorSensor?:ConveyorSensor;onConveyorSensorSelect?:(sensor:ConveyorSensor)=>void; cutaway?:boolean;crane?:CraneController;craneSensor?:CraneSensor;allSensors?:boolean;internalMechanism?:boolean;onCraneSensorSelect?:(sensor:CraneSensor)=>void;carousel?:CarouselController;carouselPower?:boolean;carouselSignal?:boolean;carouselExploded?:boolean;carouselCutaway?:boolean;carouselComparison?:ComparisonMode;carouselConnected?:boolean }) {
 const Machine = sceneRegistry[app.machine]
 const realistic=app.machine==='conveyor'||app.machine==='crane'||app.machine==='carousel'
 const craneScene=app.machine==='crane'
 const buttonRef=useRef<HTMLButtonElement>(null),secondRef=useRef<HTMLButtonElement>(null)
 const motorRef=useRef<HTMLButtonElement>(null),shaftRef=useRef<HTMLButtonElement>(null),wheelRef=useRef<HTMLButtonElement>(null)
 const encoderRefs={motor:motorRef,shaft:shaftRef,wheel:wheelRef}
 const primary=craneSensor||(app.id==='crane'?'inclinometer':'draw-wire'),secondary=primary==='inclinometer'?'draw-wire':'inclinometer'
 const markerButton=(sensor:CraneSensor,ref:RefObject<HTMLButtonElement|null>)=><button ref={ref} className={`sensor-hotspot ${selected&&sensor===primary?'selected':''} ${allSensors?`all-sensors-marker ${sensor}`:''}`} onClick={()=>onCraneSensorSelect?.(sensor)} aria-label={sensor==='inclinometer'?'Select Inclinometer':'Select Kübler draw-wire encoder'}><Crosshair size={18}/><span>{sensor==='inclinometer'?'KÜBLER INCLINOMETER':'KÜBLER DRAW-WIRE'}<small>{sensor==='inclinometer'?'BOOM ANGLE MEASUREMENT':'TELESCOPIC EXTENSION'}</small></span></button>
 return <SceneBoundary><div className="scene-canvas"><Suspense fallback={<div className="scene-fallback">Preparing 3D workspace…</div>}><Canvas frameloop="demand" shadows="percentage" dpr={[1,1.75]} camera={{position:[7,5.2,7],fov:39,near:.005,far:140}} gl={{antialias:true,alpha:true}} onCreated={({gl})=>{gl.toneMappingExposure=1}} aria-label={`${app.title} ${realistic?'interactive 3D simulation':'interactive concept 3D preview'}`}><ambientLight intensity={realistic?.22:.7}/><hemisphereLight args={['#dae9f5','#4b565d',realistic?.4:1.2]}/><directionalLight position={craneScene?[4,16,7]:[2,9,5]} intensity={realistic?2.1:3} color={realistic?'#fff8ee':'#ffffff'} castShadow shadow-mapSize={realistic?[2048,2048]:[1024,1024]} shadow-camera-left={craneScene?-14:-7} shadow-camera-right={craneScene?14:7} shadow-camera-top={craneScene?14:7} shadow-camera-bottom={craneScene?-14:-7} shadow-bias={realistic?-.00008:-.001} shadow-normalBias={realistic?.002:0}/><directionalLight position={[-6,4,-2]} intensity={realistic?1:2} color="#a9c5d8"/>{realistic?<PhotographicEnvironment evening={app.machine==='carousel'}/>:<StudioEnvironment/>}<rectAreaLight position={[0,5,0]} rotation={[-Math.PI/2,0,0]} width={craneScene?12:6} height={3} intensity={2.2} color="#e6f1ff"/><Machine carouselCutaway={carouselCutaway} conveyorSensor={conveyorSensor} onConveyorSensorSelect={onConveyorSensorSelect} carousel={carousel} carouselPower={carouselPower} carouselSignal={carouselSignal} carouselExploded={carouselExploded} carouselComparison={carouselComparison} carouselConnected={carouselConnected} craneSensor={craneSensor} allSensors={allSensors} internalMechanism={internalMechanism} onCraneSensorSelect={onCraneSensorSelect} crane={crane} conveyor={conveyor} selected={selected} cutaway={cutaway} onSensorSelect={onSelect}/>{conveyor?(['motor','shaft','wheel'] as ConveyorSensor[]).map(sensor=><SensorMarker key={sensor} app={app} selected={selected} onSelect={()=>onConveyorSensorSelect?.(sensor)} buttonRef={encoderRefs[sensor]} encoder={sensor}/>):<SensorMarker app={app} selected={selected} onSelect={onSelect} buttonRef={buttonRef} crane={crane} sensor={primary} offset={allSensors&&primary==='inclinometer'?75:0}/> }{crane&&allSensors&&<SensorMarker app={app} selected={false} onSelect={()=>onCraneSensorSelect?.(secondary)} buttonRef={secondRef} crane={crane} sensor={secondary} offset={secondary==='inclinometer'?75:0}/>} {realistic?null:<mesh rotation={[-Math.PI/2,0,0]} position={[0,-.03,0]} receiveShadow><planeGeometry args={[60,60]}/><meshStandardMaterial color="#262c2f" roughness={.95}/></mesh>}{grid&&<Grid position={[0,-.015,0]} args={[30,30]} cellSize={.5} cellThickness={.5} cellColor="#41494b" sectionSize={2} sectionThickness={.7} sectionColor="#50595b" fadeDistance={22} fadeStrength={2} infiniteGrid/>}<CameraRig app={app} request={camera} crane={crane} carousel={carousel} inspectionExpanded={carouselExploded||carouselComparison==='without'||!!(conveyor&&cutaway)}/><fog attach="fog" args={realistic?[app.machine==='carousel'?'#2e4657':'#91a0ab',craneScene?45:22,craneScene?110:65]:['#262c2f',16,35]}/></Canvas></Suspense>{conveyor?<>{(['motor','shaft','wheel'] as ConveyorSensor[]).map((sensor,i)=><button key={sensor} ref={encoderRefs[sensor]} className={`sensor-hotspot feedback-pin ${selected?'selected':''}`} onClick={()=>onConveyorSensorSelect?.(sensor)} aria-label={`Inspect ${conveyorSensors[sensor].title}`} title={conveyorSensors[sensor].title}><b>{i+1}</b><span>{conveyorSensors[sensor].title}</span></button>)}</>:crane?<>{markerButton(primary,buttonRef)}{allSensors&&markerButton(secondary,secondRef)}</>:<button ref={buttonRef} className={`sensor-hotspot ${selected?'selected':''}`} onClick={onSelect} aria-label={app.machine==='conveyor'?`Select ${conveyorSensors[conveyorSensor].title}`:`Select ${app.product}`} title={app.machine==='conveyor'?'Kübler incremental encoder · coupled solid shaft':`Concept location: ${app.product}`}><Crosshair size={18}/><span>{app.machine==='conveyor'?`KÜBLER ${conveyorSensors[conveyorSensor].title.toUpperCase()}`:<>KÜBLER SLIP RING<small>FIXED INPUT ↔ ROTATING OUTPUT</small></>}</span></button>}</div></SceneBoundary>
}

function StudioEnvironment() {
 const {gl,scene,invalidate}=useThree()
 useEffect(()=>{const generator=new PMREMGenerator(gl),room=new RoomEnvironment(),environment=generator.fromScene(room,.04);scene.environment=environment.texture;invalidate();return()=>{scene.environment=null;environment.dispose();room.dispose();generator.dispose()}},[gl,scene,invalidate])
 return null
}
export const SceneViewport=memo(SceneViewportComponent)
