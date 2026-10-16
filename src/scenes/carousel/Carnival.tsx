import { axialSector } from '../encoder/section'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ExtrudeGeometry, Group, InstancedMesh, MeshStandardMaterial, Object3D, Shape, SphereGeometry } from 'three'
import type { CarouselController } from '../../carousel/controller'
import type { CarouselMaterials } from './materials'
import { MetalBox } from '../conveyor/Hardware'
import { Ring } from './Hardware'
import { TransmissionTrace } from './SlipRing'
import { Cable } from './Machine'
import type { Vec3 } from '../../config/applications'
const TAU=Math.PI*2,COUNT=8

function makeHorse(){
 const s=new Shape();s.moveTo(-.34,.03);s.bezierCurveTo(-.4,.2,-.27,.29,-.13,.26);s.bezierCurveTo(.04,.24,.08,.31,.1,.46);s.bezierCurveTo(.1,.58,.18,.7,.25,.67);s.lineTo(.3,.74);s.lineTo(.32,.62);s.bezierCurveTo(.41,.61,.48,.53,.48,.48);s.quadraticCurveTo(.45,.43,.38,.45);s.lineTo(.28,.51);s.quadraticCurveTo(.23,.34,.27,.23);s.bezierCurveTo(.25,.03,.08,-.03,-.12,-.02);s.quadraticCurveTo(-.25,-.04,-.34,.03)
 const g=new ExtrudeGeometry(s,{depth:.18,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:20});g.translate(0,0,-.09);return g
}
function Horse({index,controller,body,cream,gold,red,navy}: {index:number;controller:CarouselController;body:ExtrudeGeometry;cream:MeshStandardMaterial;gold:MeshStandardMaterial;red:MeshStandardMaterial;navy:MeshStandardMaterial}){
 const rider=useRef<Group>(null),sleeve=useRef<Group>(null),a=index*TAU/COUNT
 useFrame(()=>{const y=1+Math.sin(controller.ridePhase+index*Math.PI/2)*.15;if(rider.current)rider.current.position.y=y;if(sleeve.current)sleeve.current.position.y=y-.14})
 const color=index%2?cream:navy
 return <group position={[Math.cos(a)*1.62,0,-Math.sin(a)*1.62]} rotation={[0,a+Math.PI/2,0]}>
  <mesh position={[0,1.62,0]} material={gold} castShadow><cylinderGeometry args={[.018,.018,2.4,20]}/></mesh>
  <group ref={rider} position={[0,1,0]}>
   <mesh geometry={body} material={color} castShadow receiveShadow/>
   <mesh position={[-.1,.14,0]} scale={[.27,.19,.15]} material={color} castShadow><sphereGeometry args={[1,24,16]}/></mesh>
   {/* Sculpted legs, saddle, mane and reins distinguish the horses at overview scale. */}
   {[-1,1].map(z=><group key={z}>
    <group position={[-.25,.025,z*.085]} rotation={[0,0,-.38]}><mesh position={[0,-.115,0]} material={color} castShadow><cylinderGeometry args={[.042,.024,.23,12]}/></mesh><mesh position={[-.04,-.24,0]} rotation={[0,0,.38]} material={gold} castShadow><boxGeometry args={[.09,.055,.06]}/></mesh></group>
    <group position={[.19,.04,z*.085]} rotation={[0,0,.68]}><mesh position={[0,-.1,0]} material={color} castShadow><cylinderGeometry args={[.038,.022,.2,12]}/></mesh><mesh position={[.04,-.2,0]} rotation={[0,0,-.68]} material={gold} castShadow><boxGeometry args={[.085,.05,.06]}/></mesh></group>
    <mesh position={[.315,.56,z*.12]} material={navy}><sphereGeometry args={[.014,12,8]}/></mesh>
    <mesh position={[.36,.5,z*.115]} rotation={[0,0,.25]} material={red}><boxGeometry args={[.035,.09,.012]}/></mesh>
    <mesh position={[.14,.28,z*.14]} rotation={[0,0,-.7]} material={gold}><boxGeometry args={[.016,.38,.014]}/></mesh>
   </group>)}
   <mesh position={[-.09,.28,0]} material={red} scale={[.18,.06,.17]} castShadow><sphereGeometry args={[1,24,12]}/></mesh>
   <mesh position={[-.22,.3,0]} rotation={[0,0,-.2]} material={gold}><boxGeometry args={[.035,.1,.27]}/></mesh>
   <mesh position={[.115,.43,0]} rotation={[0,0,-.22]} material={gold} scale={[.045,.22,.13]}><sphereGeometry args={[1,16,12]}/></mesh>
   <mesh position={[-.37,.02,0]} rotation={[0,0,-.5]} material={gold} scale={[.04,.21,.06]} castShadow><sphereGeometry args={[1,16,12]}/></mesh>
  </group>
  <group ref={sleeve} position={[0,.86,0]}><mesh material={gold} castShadow><cylinderGeometry args={[.028,.028,.34,20]}/></mesh></group>
  <MetalBox position={[0,.47,0]} size={[.24,.05,.22]} material={gold}/>
  <mesh position={[0,.4,0]} material={navy}><cylinderGeometry args={[.045,.06,.13,20]}/></mesh>
 </group>
}
export function Carnival({controller,m,inspect,connected,power}:{controller:CarouselController;m:CarouselMaterials;inspect:boolean;connected:boolean;power:boolean}){
 const rotor=useRef<Group>(null),lights=useRef<InstancedMesh>(null)
 const assets=useMemo(()=>({
  cream:new MeshStandardMaterial({color:'#e9dfc9',roughness:.35,metalness:.12}),navy:new MeshStandardMaterial({color:'#163c4a',roughness:.32,metalness:.25}),red:new MeshStandardMaterial({color:'#9c3f36',roughness:.34,metalness:.2}),gold:new MeshStandardMaterial({color:'#c6a15e',metalness:.8,roughness:.3}),wood:new MeshStandardMaterial({color:'#84624b',roughness:.65}),bulb:new MeshStandardMaterial({color:'#ffdc9c',emissive:'#ffb943',emissiveIntensity:3,toneMapped:false}),horse:makeHorse(),bulbGeometry:new SphereGeometry(.022,8,6),baseSection:axialSector(2.4,2.28,.28),deckSection:axialSector(2.18,.24,.16),mastSection:axialSector(.15,.055,1.18),collarSection:axialSector(.16,.05,.1),fixedRaceSection:axialSector(.285,.19,.025),rotatingRaceSection:axialSector(.31,.06,.025)
 }),[])
 useEffect(()=>()=>{Object.values(assets).forEach(a=>a.dispose())},[assets])
 useEffect(()=>{if(!lights.current)return;const o=new Object3D();for(let i=0;i<160;i++){const a=i/160*TAU;o.position.set(Math.cos(a)*2.32,2.92,-Math.sin(a)*2.32);o.updateMatrix();lights.current.setMatrixAt(i,o.matrix)}lights.current.instanceMatrix.needsUpdate=true},[])
 useEffect(()=>{assets.bulb.emissiveIntensity=connected?2.8:0;assets.bulb.color.set(connected?'#ffe5ac':'#817a69')},[assets,connected])
 useFrame(()=>{if(rotor.current)rotor.current.rotation.y=controller.motion.angleRadians})
 const output:Vec3[]=[[.98,.088,0],[.45,.088,0],[.35,.12,0],[.35,.51,0],[1.22,.51,0],[1.22,2.7,0],[1.9,2.84,0],[2.3,2.9,0]]
 return <group>
  {inspect?<mesh position={[0,.14,0]} rotation={[Math.PI/2,0,0]} geometry={assets.baseSection} material={assets.navy} castShadow receiveShadow/>:<Ring position={[0,.14,0]} outer={2.4} inner={2.28} height={.28} material={assets.navy}/>}
  <mesh position={[0,.025,0]} material={m.structure} receiveShadow><cylinderGeometry args={[2.28,2.28,.03,64]}/></mesh>
  <Ring position={[0,.285,0]} outer={2.3} inner={2.18} height={.025} material={assets.gold}/>
  {inspect?<mesh position={[0,.39,0]} rotation={[Math.PI/2,0,0]} geometry={assets.deckSection} material={assets.wood} castShadow receiveShadow/>:<Ring position={[0,.39,0]} outer={2.18} inner={.24} height={.16} material={assets.wood}/>}
  {inspect?<><mesh position={[0,.98,0]} rotation={[Math.PI/2,0,0]} geometry={assets.mastSection} material={assets.navy}/><mesh position={[0,.36,0]} rotation={[Math.PI/2,0,0]} geometry={assets.collarSection} material={assets.gold}/></>:<><Ring position={[0,.98,0]} outer={.15} inner={.055} height={1.18} material={assets.navy}/><Ring position={[0,.36,0]} outer={.16} inner={.05} height={.1} material={assets.gold}/></>}
  <Ring position={[0,1.36,0]} outer={.17} inner={.06} height={.12} material={assets.gold}/>
  <mesh position={[0,1.5,0]} material={assets.navy} castShadow><cylinderGeometry args={[.065,.065,.18,32]}/></mesh>
  <mesh position={[0,2.47,0]} material={assets.navy} castShadow><cylinderGeometry args={[.065,.065,.86,32]}/></mesh>
  {inspect?<><mesh position={[0,.2725,0]} rotation={[Math.PI/2,0,0]} geometry={assets.fixedRaceSection} material={m.stainless}/><mesh position={[0,.2975,0]} rotation={[Math.PI/2,0,0]} geometry={assets.rotatingRaceSection} material={assets.gold}/></>:<><Ring position={[0,.2725,0]} outer={.285} inner={.19} height={.025} material={m.stainless}/><Ring position={[0,.2975,0]} outer={.31} inner={.06} height={.025} material={assets.gold}/></>}
  {[0,1,2,3].map(i=>{const a=i*Math.PI/2;return <mesh key={i} position={[Math.cos(a)*.23,.15,Math.sin(a)*.23]} material={m.stainless} castShadow><cylinderGeometry args={[.018,.023,.22,20]}/></mesh>})}
  <MetalBox position={[0,.195,-.09]} size={[.10,.035,.13]} material={m.stainless}/>
  {[-.035,.035].map(x=><MetalBox key={x} position={[x,.11,-.1]} size={[.018,.15,.035]} material={m.stainless}/>)}
  {/* Fixed supply cabinet sits clear of the rotating deck and horse envelope. */}

  <MetalBox position={[-2.45,.57,-1.25]} size={[.42,1.08,.32]} material={assets.navy} radius={.015}/>
  <MetalBox position={[-2.45,.77,-1.082]} size={[.3,.3,.012]} material={m.screen}/>
  <mesh position={[-2.52,.52,-1.08]} rotation={[Math.PI/2,0,0]} material={m.green}><cylinderGeometry args={[.025,.025,.016,20]}/></mesh>

  <group ref={rotor}>
   <Ring position={[0,.48,0]} outer={2.2} inner={2.16} height={.035} material={assets.gold}/>
   {Array.from({length:COUNT},(_,i)=><Horse key={i} index={i} controller={controller} body={assets.horse} cream={assets.cream} gold={assets.gold} red={assets.red} navy={assets.navy}/>)}
   <Ring position={[.35,.479,0]} outer={.013} inner={.006} height={.018} material={m.sensorBlack}/>
   <Cable points={output} m={m} radius={.006}/><TransmissionTrace points={output} color="#ffb869" controller={controller} enabled={power} active={connected} traceScale={4}/>
   <Cable points={[[.98,.088,0],[.45,.088,0],[.35,.12,0],[.35,.51,0],[0,.51,0]]} m={m} radius={.006}/>
   <TransmissionTrace points={[[.98,.088,0],[.45,.088,0],[.35,.12,0],[.35,.51,0],[0,.51,0]]} color="#ffb869" controller={controller} enabled={power} active={connected} traceScale={3}/>
   {Array.from({length:COUNT},(_,i)=>{const a=i*TAU/COUNT,points:Vec3[]=[[0,.51,0],[Math.cos(a)*.65,.51,-Math.sin(a)*.65],[Math.cos(a)*1.5,.51,-Math.sin(a)*1.5],[Math.cos(a)*1.62,.52,-Math.sin(a)*1.62]];return <group key={i}><Cable points={points} m={m} radius={.004}/><TransmissionTrace points={points} color="#ffb869" controller={controller} enabled={power} active={connected} traceScale={3}/></group>})}
   {/* The canopy lifts out of the inspection view to keep the Kübler interface exposed. */}
   <group visible={!inspect}>
    <mesh position={[0,2.93,0]} material={assets.navy} castShadow><cylinderGeometry args={[2.32,2.32,.2,64]}/></mesh>
    {Array.from({length:16},(_,i)=>{const a=i*TAU/16;return <group key={i} rotation={[0,a,0]}>
     <mesh position={[0,3.27,0]} material={i%2?assets.cream:assets.red} castShadow><cylinderGeometry args={[.14,2.34,.52,4,1,false,0,TAU/16]}/></mesh>
     <mesh position={[2.32,2.8,0]} material={assets.gold} castShadow><sphereGeometry args={[.095,16,10]}/></mesh>
    </group>})}
    {[2.83,3.04].map(y=><Ring key={y} position={[0,y,0]} outer={2.36} inner={2.28} height={.035} material={assets.gold}/>)}
    <mesh position={[0,3.6,0]} material={assets.gold} castShadow><sphereGeometry args={[.12,24,16]}/></mesh>
    <mesh position={[0,3.79,0]} material={assets.gold}><coneGeometry args={[.07,.22,24]}/></mesh>
    <instancedMesh ref={lights} args={[assets.bulbGeometry,assets.bulb,160]}/>
   </group>
   {Array.from({length:48},(_,i)=>{const a=i*TAU/48;return <mesh key={i} position={[Math.cos(a)*2.21,.34,-Math.sin(a)*2.21]} material={assets.bulb}><sphereGeometry args={[.018,8,6]}/></mesh>})}
  </group>
 </group>
}
