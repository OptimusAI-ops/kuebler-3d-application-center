import { ExtrudeGeometry, Shape } from 'three'
/** A real open sector, rather than a transparent solid, keeps section views legible. Axis Z. */
export function axialSector(outer:number,inner:number,depth:number,start=Math.PI/2,sweep=Math.PI*1.5){
 const s=new Shape();s.moveTo(Math.cos(start)*outer,Math.sin(start)*outer);s.absarc(0,0,outer,start,start+sweep,false)
 if(inner>0){s.lineTo(Math.cos(start+sweep)*inner,Math.sin(start+sweep)*inner);s.absarc(0,0,inner,start+sweep,start,true)}else s.lineTo(0,0)
 s.closePath();const g=new ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:48});g.translate(0,0,-depth/2);return g
}
