import { ReturnSpring } from './ReturnSpring'
import { axialSector } from '../encoder/section'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { BufferAttribute, BufferGeometry, Line as ThreeLine, LineBasicMaterial } from 'three'
import type { Group, Mesh } from 'three'
import type { CraneController } from '../../crane/controller'
import { cableAnchorLocal, cableExitLocal, DRAW_WIRE, drawWireReadout } from '../../crane/drawWire'
import { CRANE } from '../../crane/kinematics'
import { AxialCylinder, Bolt, MetalBox } from '../conveyor/Hardware'
import type { CraneMaterials } from './materials'
function Winding({controller}:{controller:CraneController}){
 const points=useMemo(()=>new Float32Array(1025*3),[])
 const line=useMemo(()=>{const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(points,3));g.setDrawRange(0,1025);return new ThreeLine(g,new LineBasicMaterial({color:'#c7d2d4'}))},[points])
 const lead=useRef<Mesh>(null)
 useEffect(()=>()=>{line.geometry.dispose();(line.material as LineBasicMaterial).dispose()},[line])
 useFrame(()=>{
  const reading=drawWireReadout(controller.motion),remainingAngle=Math.max(0,reading.remainingCable)/DRAW_WIRE.drumRadius,turns=remainingAngle/(2*Math.PI)
  for(let i=0;i<=1024;i++){const u=i/1024,a=Math.PI/2+remainingAngle*(1-u);points[i*3]=Math.cos(a)*DRAW_WIRE.drumRadius;points[i*3+1]=Math.sin(a)*DRAW_WIRE.drumRadius;points[i*3+2]=-.018+u*turns*DRAW_WIRE.windingPitch}
  line.geometry.attributes.position.needsUpdate=true;line.geometry.computeBoundingSphere()
  if(lead.current){const endZ=-.018+turns*DRAW_WIRE.windingPitch;lead.current.position.set(.0375,DRAW_WIRE.drumRadius,endZ/2);lead.current.rotation.y=Math.atan2(endZ,.075);lead.current.scale.x=Math.hypot(.075,endZ)}
 })
 return <group><primitive object={line}/><mesh ref={lead}><boxGeometry args={[1,.0009,.0009]}/><meshStandardMaterial color="#c7d2d4" metalness={.9} roughness={.28}/></mesh></group>
}
export function DrawWireSensor({controller,m,selected,internal,onSelect}:{controller:CraneController;m:CraneMaterials;selected:boolean;internal:boolean;onSelect:()=>void}){
 const sections=useMemo(()=>({body:axialSector(.061,.056,.074,Math.PI/2,Math.PI),flange:axialSector(.048,.006,.002,Math.PI,Math.PI)}),[])
 useEffect(()=>()=>Object.values(sections).forEach(g=>g.dispose()),[sections])
 const drum=useRef<Group>(null),shaft=useRef<Group>(null),wire=useRef<Mesh>(null)
 const housingMaterial=internal?m.cutawayHousing:m.drawHousing
 const cable=useMemo(()=>{const g=new LineGeometry();g.setPositions([0,0,0,1,0,0]);return new Line2(g,new LineMaterial({color:'#9fdfed',linewidth:2.2,transparent:true,opacity:.95,depthTest:false}))},[])
 useEffect(()=>()=>{cable.geometry.dispose();cable.material.dispose()},[cable])
 useFrame(({size})=>{
  const reading=drawWireReadout(controller.motion),exit=cableExitLocal(),anchor=cableAnchorLocal(controller.motion)
  if(drum.current)drum.current.rotation.z=reading.drumRadians
  if(shaft.current)shaft.current.rotation.z=reading.drumRadians
  if(wire.current){wire.current.position.set((exit[0]+anchor[0])/2,exit[1],exit[2]);wire.current.scale.y=reading.cablePayout}
  const start=cable.geometry.attributes.instanceStart,end=cable.geometry.attributes.instanceEnd;start.setXYZ(0,...exit);end.setXYZ(0,...anchor);start.needsUpdate=true;end.needsUpdate=true;cable.geometry.computeBoundingSphere();cable.material.resolution.set(size.width,size.height)
 })
 return <group>
  <mesh ref={wire} rotation={[0,0,-Math.PI/2]} material={m.steel} castShadow><cylinderGeometry args={[DRAW_WIRE.wireDiameter/2,DRAW_WIRE.wireDiameter/2,1,8]}/></mesh>
  {selected&&<primitive object={cable} renderOrder={10}/>}
  <group position={CRANE.drawWireHousing} onClick={event=>{event.stopPropagation();onSelect()}}>
   <MetalBox position={[0,0,-.064]} size={[.17,.17,.012]} material={m.steel} radius={.009}/>
   <MetalBox position={[0,0,-.041]} size={[.124,.124,.012]} material={housingMaterial} radius={.014}/>
   {internal?<mesh geometry={sections.body} material={m.drawHousing} castShadow/>:<AxialCylinder radius={.061} depth={.074} material={housingMaterial}/>}
   {!internal&&<AxialCylinder position={[0,0,.028]} radius={.047} depth={.015} material={housingMaterial}/>}
   {!internal&&<MetalBox position={[0,0,.036]} size={[.068,.094,.022]} material={housingMaterial} radius={.015}/>}
   {!internal&&<><MetalBox position={[0,-.003,.0473]} size={[.047,.052,.001]} material={m.drawLabel} radius={.001}/>{[-.025,.025].map(x=><MetalBox key={x} position={[x,-.003,.048]} size={[.002,.052,.001]} material={m.orange}/>)}</>}
   {!internal&&[-.025,.025].map(x=>[-.035,.035].map(y=><Bolt key={`cover${x}/${y}`} position={[x,y,.048]} material={m.recess} radius={.0032}/>))}
   {[-.049,.049].map(x=>[-.049,.049].map(y=><Bolt key={`${x}/${y}`} position={[x,y,.004]} material={m.steel} radius={.0045}/>))}
   {[-.071,.071].map(x=>[-.071,.071].map(y=><Bolt key={`${x}/${y}`} position={[x,y,-.055]} material={m.steel} radius={.0055}/>))}
   <group position={[.065,.045,0]} rotation={[0,Math.PI/2,0]}><AxialCylinder radius={.007} depth={.02} material={m.steel}/><AxialCylinder position={[0,0,.011]} radius={.002} depth={.002} material={m.recess}/></group>
   <group rotation={[Math.PI/2,0,0]} position={[0,-.063,.018]}><AxialCylinder radius={.006} depth={.023} material={m.steel}/><AxialCylinder position={[0,0,.016]} radius={.0055} depth={.012} material={m.recess}/></group>
   <MetalBox position={[-.08,-.035,-.015]} size={[.026,.012,.02]} material={m.recess} radius={.005}/>
   {internal&&<>
    <group ref={drum}><AxialCylinder position={[0,0,-.003]} radius={.0438} depth={.035} material={m.aluminium}/><AxialCylinder position={[0,0,-.023]} radius={.048} depth={.002} material={m.steel}/><mesh position={[0,0,.017]} geometry={sections.flange} material={m.steel}/>{[0,1,2].map(i=><MetalBox key={i} position={[Math.cos(i*Math.PI*2/3)*.025,Math.sin(i*Math.PI*2/3)*.025,.019]} size={[.02,.005,.002]} rotation={[0,0,i*Math.PI*2/3]} material={m.orange}/>)}</group>
    <Winding controller={controller}/><ReturnSpring controller={controller}/>
    <group ref={shaft}><AxialCylinder radius={.004} depth={.075} material={m.steel}/><MetalBox position={[.006,0,.029]} size={[.012,.003,.004]} material={m.orange}/></group>
    <group><AxialCylinder position={[0,0,.03]} radius={.007} depth={.004} material={m.orange}/><MetalBox position={[0,0,.036]} size={[.022,.018,.0015]} material={m.drawPCB} radius={.002}/><MetalBox position={[0,0,.0375]} size={[.006,.006,.0012]} material={m.recess}/><MetalBox position={[-.013,0,.033]} size={[.004,.014,.013]} material={m.steel}/></group>
   </>}
   {selected&&<mesh position={[0,0,.053]}><ringGeometry args={[.085,.087,64]}/><meshBasicMaterial color="#ffad64" depthTest={false} transparent opacity={.9}/></mesh>}
  </group>
 </group>
}
export function DrawWireAnchor({m}:{m:CraneMaterials}){
 const [x,y,z]=CRANE.drawWireAnchor
 return <group position={[x,y,z]}>
  <MetalBox position={[0,0,-.163]} size={[.12,.1,.018]} material={m.steel} radius={.006}/>
  <MetalBox position={[0,0,-.08]} size={[.035,.06,.16]} material={m.steel} radius={.006}/>
  <mesh rotation={[0,Math.PI/2,0]} material={m.steel} castShadow><torusGeometry args={[.012,.003,8,24]}/></mesh>
  {[-.04,.04].map(dx=><Bolt key={dx} position={[dx,0,-.15]} material={m.steel} radius={.006}/>)}
 </group>
}
