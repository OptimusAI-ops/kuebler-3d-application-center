import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, CatmullRomCurve3, MeshStandardMaterial, SRGBColorSpace, Vector3 } from 'three'
import type { Group } from 'three'
import { AxialCylinder, Bolt, MetalBox } from './Hardware'
import { Ring } from '../carousel/Hardware'
import type { ConveyorMaterials } from '../../conveyor/materials'
import type { ConveyorController } from '../../conveyor/controller'
import { FEEDBACK } from '../../conveyor/feedback'
export function IntegratedMotorFeedback({controller,m,sectioned}:{controller:ConveyorController;m:ConveyorMaterials;sectioned:boolean}){
 const rotor=useRef<Group>(null)
 const resources=useMemo(()=>{
  const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d')!;x.fillStyle='#eeeeE5';x.fillRect(0,0,512,256);x.fillStyle='#e77f34';x.fillRect(0,0,512,20);x.fillStyle='#263438';x.font='bold 62px Arial';x.fillText('Kübler',22,92);x.font='40px Arial';x.fillText('RIM2000',22,154);x.font='21px Arial';x.fillText('MAGNETIC FEEDBACK',22,208)
  const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace
  return {texture:t,label:new MeshStandardMaterial({map:t,roughness:.6}),copper:new MeshStandardMaterial({color:'#a85f34',metalness:.82,roughness:.3}),wire:new CatmullRomCurve3([new Vector3(1.813,1.101,-1.275),new Vector3(1.87,1.14,-1.275),new Vector3(1.9,1.18,-1.13),new Vector3(1.85,1.24,-1.08)])}
 },[])
 useEffect(()=>()=>{resources.texture.dispose();resources.label.dispose();resources.copper.dispose()},[resources])
 useFrame(()=>{if(rotor.current)rotor.current.rotation.z=-controller.motion.shaftRadians*FEEDBACK.gearboxRatio})
 return <group visible={sectioned}>
  {/* The magnetic ring is keyed to the rotor shaft; the read head is fixed to the end shield. */}
  <group position={[1.8,1.05,-1.275]}>
   <group ref={rotor}>
    <AxialCylinder radius={.0125} depth={.17} material={m.steel}/>
    <group rotation={[Math.PI/2,0,0]}><Ring outer={.032} inner={.0125} height={.012} material={m.steel}/><Ring outer={.0325} inner={.028} height={.010} material={m.recess}/></group>
    <AxialCylinder position={[0,0,.065]} radius={.09} depth={.09} material={m.steel}/>
    {Array.from({length:24},(_,i)=>{const a=i*Math.PI/12;return <MetalBox key={i} position={[Math.cos(a)*.087,Math.sin(a)*.087,.065]} rotation={[0,0,a]} size={[.008,.008,.088]} material={m.aluminium} radius={.001}/>})}
    <MetalBox position={[.016,0,-.009]} size={[.006,.006,.012]} material={m.steel}/>
   </group>
   <MetalBox position={[0,.0418,0]} size={[.027,.018,.015]} material={m.aluminium} radius={.002}/>
   <MetalBox position={[0,.0418,-.0077]} size={[.023,.014,.0005]} material={resources.label} radius={.0004}/>
   <mesh position={[-.01,.039,-.0083]}><sphereGeometry args={[.0017,12,8]}/><meshStandardMaterial color="#b9d56b" emissive="#6b982c" emissiveIntensity={.4}/></mesh>
   <MetalBox position={[0,.0528,.009]} size={[.04,.004,.028]} material={m.steel}/>
   <MetalBox position={[0,.1,.022]} size={[.035,.094,.006]} material={m.steel} radius={.002}/>
   {[-.011,.011].map(x=><Bolt key={`shield-${x}`} position={[x,.137,.018]} radius={.003} material={m.steel}/>)}
   {[-.017,.017].map(x=><Bolt key={x} position={[x,.052,.013]} radius={.003} rotation={[-Math.PI/2,0,0]} material={m.steel}/>)}
   {/* Rear bearing and end-shield mount support the shaft independently of the sensor. */}
   <group rotation={[Math.PI/2,0,0]} position={[0,0,.033]}><Ring outer={.031} inner={.0128} height={.014} material={m.steel}/><Ring outer={.026} inner={.015} height={.0145} material={m.recess}/></group>
   {[0,1,2,3,4,5].map(i=>{const a=i*Math.PI/3;return <group key={i} position={[Math.cos(a)*.12,Math.sin(a)*.12,.085]} rotation={[0,0,a]}><mesh rotation={[Math.PI/2,0,0]} material={resources.copper}><torusGeometry args={[.017,.006,8,24]}/></mesh><MetalBox size={[.018,.035,.07]} material={resources.copper} radius={.005}/></group>})}
  </group>
  <mesh material={m.rubber}><tubeGeometry args={[resources.wire,32,.002,8,false]}/></mesh>
 </group>
}
