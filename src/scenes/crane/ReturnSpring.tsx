import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial } from 'three'
import type { CraneController } from '../../crane/controller'
import { drawWireReadout } from '../../crane/drawWire'
/** Functional spiral return spring, not a claim about the manufacturer's internal layout. */
export function ReturnSpring({controller}:{controller:CraneController}){
 const spring=useMemo(()=>{const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(new Float32Array(769*3),3));return new Line(g,new LineBasicMaterial({color:'#deb37b'}))},[])
 useEffect(()=>()=>{spring.geometry.dispose();(spring.material as LineBasicMaterial).dispose()},[spring])
 useFrame(()=>{const r=drawWireReadout(controller.motion),p=spring.geometry.attributes.position,turns=5+r.cablePayout*.12
  for(let i=0;i<=768;i++){const t=i/768,a=t*turns*Math.PI*2,radius=.036-t*.029;p.setXYZ(i,Math.cos(a)*radius,Math.sin(a)*radius,.026)}p.needsUpdate=true;spring.geometry.computeBoundingSphere()
 })
 return <group><primitive object={spring}/><mesh position={[.038,0,.026]}><boxGeometry args={[.007,.006,.006]}/><meshStandardMaterial color="#a7b5b9" metalness={.9} roughness={.3}/></mesh></group>
}
