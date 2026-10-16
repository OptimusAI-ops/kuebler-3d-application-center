import { useEffect, useMemo } from 'react'
import { ExtrudeGeometry, Path, Shape } from 'three'
import type { Material } from 'three'
import type { Vec3 } from '../../config/applications'
export function Ring({position=[0,0,0],outer,inner,height,material}:{position?:Vec3;outer:number;inner:number;height:number;material:Material}){
 const geometry=useMemo(()=>{const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);const g=new ExtrudeGeometry(s,{depth:height,bevelEnabled:false,curveSegments:64});g.rotateX(-Math.PI/2);g.translate(0,-height/2,0);return g},[outer,inner,height])
 useEffect(()=>()=>geometry.dispose(),[geometry])
 return <mesh position={position} geometry={geometry} material={material} castShadow receiveShadow/>
}
export function VerticalCylinder({position=[0,0,0],radius,height,material}:{position?:Vec3;radius:number;height:number;material:Material}){return <mesh position={position} material={material} castShadow receiveShadow><cylinderGeometry args={[radius,radius,height,64]}/></mesh>}
