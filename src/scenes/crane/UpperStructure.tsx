import { AxialCylinder, Bolt, MetalBox } from '../conveyor/Hardware'
import type { CraneMaterials } from './materials'
export function UpperStructure({m}:{m:CraneMaterials}){return <group>
 <mesh position={[-1,1.28,0]} material={m.dark} castShadow><cylinderGeometry args={[.88,.88,.2,80]}/></mesh>
 <mesh position={[-1,1.4,0]} material={m.steel} castShadow><cylinderGeometry args={[.8,.8,.07,80]}/></mesh>
 {Array.from({length:20},(_,i)=>{const a=i*Math.PI/10;return <Bolt key={i} position={[-1+Math.cos(a)*.81,1.39,Math.sin(a)*.81]} rotation={[-Math.PI/2,0,0]} material={m.steel} radius={.018}/>})}
 <MetalBox position={[-1.96,1.68,-.08]} size={[2.35,.42,1.96]} material={m.dark} radius={.04}/>
 <MetalBox position={[-2.8,2.05,-.08]} size={[.84,.62,2.05]} material={m.yellow} radius={.08}/>
 {[-.09,.09].map(y=><MetalBox key={y} position={[-3.23,2.05+y,-.08]} size={[.008,.014,1.85]} material={m.recess}/>)}
 <MetalBox position={[-2.06,1.99,-.7]} size={[.65,.36,.65]} material={m.yellow} radius={.04}/>
 {Array.from({length:9},(_,i)=><MetalBox key={i} position={[-2.29+i*.058,2,-1.033]} size={[.019,.22,.008]} material={m.recess}/>)}
 {[-.51,.51].map(z=><group key={z}>
  <MetalBox position={[-1.04,2.15,z]} size={[.42,1.3,.18]} material={m.yellow} radius={.03}/>
  <MetalBox position={[-1.4,1.91,z]} size={[.14,.9,.18]} rotation={[0,0,-.35]} material={m.dark}/>
  <AxialCylinder position={[-1,2.8,z]} radius={.2} depth={.2} material={m.yellow}/>
  <AxialCylinder position={[-1,2.8,z+Math.sign(z)*.12]} radius={.115} depth={.05} material={m.steel}/>
  <Bolt position={[-1,2.8,z+Math.sign(z)*.15]} rotation={[0,z<0?Math.PI:0,0]} material={m.steel} radius={.04}/>
  <MetalBox position={[-.52,1.25,z*.47]} size={[.36,.3,.12]} material={m.dark} radius={.035}/>
 </group>)}
 {/* Independent operator cab sits beside the boom sweep, with a clear glazed roof. */}
 <group position={[-.9,0,1.07]}>
  <MetalBox position={[0,1.92,0]} size={[1.55,.88,.85]} material={m.yellow} radius={.065}/>
  <MetalBox position={[0,2.36,0]} size={[1.55,.08,.89]} material={m.yellow} radius={.025}/>
  <MetalBox position={[.12,2.03,.434]} size={[1.12,.54,.025]} material={m.glass} radius={.03}/>
  <MetalBox position={[.79,2.03,0]} size={[.025,.56,.7]} material={m.glass} radius={.025}/>
  <MetalBox position={[.12,2.407,0]} size={[1.15,.014,.64]} material={m.glass} radius={.02}/>
  <MetalBox position={[-.44,2.04,.455]} size={[.035,.6,.025]} material={m.yellow}/>
  <MetalBox position={[-.53,1.72,.452]} size={[.16,.035,.025]} material={m.recess}/>
  <MetalBox position={[.72,2.02,.54]} size={[.05,.04,.2]} material={m.dark}/>
  <MetalBox position={[.75,2.03,.66]} size={[.1,.2,.08]} material={m.dark}/>
  <MetalBox position={[.1,1.45,.48]} size={[1.2,.06,.25]} material={m.aluminium}/>
 </group>
 <group position={[-1.9,2.12,.1]}><AxialCylinder radius={.25} depth={.67} material={m.dark}/>{[-.35,.35].map(z=><AxialCylinder key={z} position={[0,0,z]} radius={.3} depth={.04} material={m.yellow}/>)}{Array.from({length:14},(_,i)=><mesh key={i} position={[0,0,(i-6.5)*.044]} material={m.steel}><torusGeometry args={[.255,.014,8,40]}/></mesh>)}</group>
</group>}
