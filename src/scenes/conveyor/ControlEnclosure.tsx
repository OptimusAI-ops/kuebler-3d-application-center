import { useEffect, useMemo } from 'react'
import { CanvasTexture, MeshStandardMaterial, SRGBColorSpace } from 'three'
import { AxialCylinder, Bolt, MetalBox } from './Hardware'
import type { ConveyorMaterials } from '../../conveyor/materials'
/** Cosmetic machine-side service enclosure; does not participate in drive kinematics. */
export function ControlEnclosure({m}:{m:ConveyorMaterials}){
 const label=useMemo(()=>{const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d')!;x.fillStyle='#ced6d7';x.fillRect(0,0,512,256);x.fillStyle='#24353e';x.font='bold 42px Arial';x.fillText('DRIVE / 01',25,63);x.font='24px Arial';x.fillText('APPLICATION CENTER',25,105);for(let i=0;i<7;i++){x.fillStyle=i%2?'#657a84':'#33454e';x.fillRect(25,135+i*12,300-i*20,3)}const map=new CanvasTexture(c);map.colorSpace=SRGBColorSpace;return new MeshStandardMaterial({map,roughness:.6})},[])
 useEffect(()=>()=>{label.map?.dispose();label.dispose()},[label])
 return <group position={[-.82,.69,.66]}>
  <MetalBox size={[.32,.38,.14]} material={m.paint} radius={.015}/>
  <MetalBox position={[0,0,.073]} size={[.294,.35,.012]} material={m.aluminium} radius={.01}/>
  <MetalBox position={[0,.065,.081]} size={[.245,.125,.002]} material={label} radius={.001}/>
  {[-.13,.13].map(x=>[-.145,.145].map(y=><Bolt key={`${x}/${y}`} position={[x,y,.084]} radius={.006} material={m.steel}/>))}
  {[-.08,.08].map((x,i)=><group key={x}><AxialCylinder position={[x,-.075,.085]} radius={.026} depth={.012} material={m.recess}/><mesh position={[x,-.075,.098]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[i?.019:.016,i?.019:.016,.012,24]}/><meshStandardMaterial color={i?'#bd382c':'#4a8b70'} roughness={.35}/></mesh></group>)}
  {[-.07,.07].map(x=><group key={x}><MetalBox position={[x,-.21,0]} size={[.035,.05,.035]} material={m.recess} radius={.005}/><MetalBox position={[x,-.29,-.015]} size={[.015,.16,.015]} material={m.rubber} radius={.005}/></group>)}
 </group>
}
