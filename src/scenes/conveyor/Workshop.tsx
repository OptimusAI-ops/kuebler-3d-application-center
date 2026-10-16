import { useEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { ContactShadows, SoftShadows } from '@react-three/drei'
import { Color, EquirectangularReflectionMapping, PMREMGenerator } from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import type { ConveyorMaterials } from '../../conveyor/materials'
import { MetalBox } from './Hardware'
/** Local CC0 HDRI; no remote requests at runtime. */
export function PhotographicEnvironment({evening=false}:{evening?:boolean}){
 const hdr=useLoader(HDRLoader,'/environments/industrial-workshop-2k.hdr')
 const {gl,scene,invalidate}=useThree()
 useEffect(()=>{
  hdr.mapping=EquirectangularReflectionMapping
  const generator=new PMREMGenerator(gl),environment=generator.fromEquirectangular(hdr)
  const previous={environment:scene.environment,background:scene.background,environmentIntensity:scene.environmentIntensity,backgroundIntensity:scene.backgroundIntensity,backgroundBlurriness:scene.backgroundBlurriness}
  scene.environment=environment.texture;scene.background=new Color(evening?'#2e4657':'#91a0ab');scene.environmentIntensity=evening?.6:.85;scene.backgroundIntensity=1;scene.backgroundBlurriness=.2
  scene.environmentRotation.set(0,1.8,0);scene.backgroundRotation.set(0,1.8,0);invalidate()
  return()=>{Object.assign(scene,previous);scene.environmentRotation.set(0,0,0);scene.backgroundRotation.set(0,0,0);environment.dispose();generator.dispose()}
 },[hdr,gl,scene,invalidate,evening])
 return null
}
export function Workshop({materials}:{materials:ConveyorMaterials}){
 return <group>
  <SoftShadows size={8} samples={10} focus={.25}/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.002,0]} receiveShadow material={materials.floor}><planeGeometry args={[60,60]}/></mesh>
  {/* Expansion joints and restrained work-cell markings ground the machine at full scale. */}
  {[-8,-4,4,8].map(n=><group key={n}><MetalBox position={[n,-.0007,0]} size={[.008,.001,28]} material={materials.recess}/><MetalBox position={[0,-.0007,n]} size={[28,.001,.008]} material={materials.recess}/></group>)}
  {[-1,1].map(z=><group key={z}><mesh position={[0,.0005,z*1.9]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[5.4,.055]}/><meshStandardMaterial color="#ac9459" roughness={.94} transparent opacity={.65}/></mesh>{[-1,1].map(x=><mesh key={x} position={[x*2.68,.0005,z*1.48]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[.055,.88]}/><meshStandardMaterial color="#ac9459" roughness={.94} transparent opacity={.65}/></mesh>)}</group>)}
  <ContactShadows position={[0,.001,0]} scale={10} opacity={.46} blur={2.5} far={3.5} resolution={512} color="#17201e" frames={Infinity}/>
 </group>
}
