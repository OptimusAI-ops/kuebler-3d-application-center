import { BufferGeometry, Float32BufferAttribute, CanvasTexture, RepeatWrapping, SRGBColorSpace, Shape, Path, ExtrudeGeometry } from 'three'
import { CONVEYOR, TAU } from './simulation.ts'
export const DRIVE_X=CONVEYOR.rollerCenters/2
export const ENCODER_POSITION: [number,number,number]=[DRIVE_X,CONVEYOR.shaftHeight,.961]
export function beltPoint(s:number) {
 const d=CONVEYOR.rollerCenters,r=CONVEYOR.rollerRadius+.007,total=2*d+TAU*r
 s=((s%total)+total)%total
 if(s<d)return [-d/2+s,CONVEYOR.shaftHeight+r]
 s-=d
 if(s<Math.PI*r){const a=Math.PI/2-s/r;return [d/2+r*Math.cos(a),CONVEYOR.shaftHeight+r*Math.sin(a)]}
 s-=Math.PI*r
 if(s<d)return [d/2-s,CONVEYOR.shaftHeight-r]
 s-=d;const a=-Math.PI/2-s/r;return [-d/2+r*Math.cos(a),CONVEYOR.shaftHeight+r*Math.sin(a)]
}
export function buildBeltGeometry() {
 const length=2*CONVEYOR.rollerCenters+TAU*(CONVEYOR.rollerRadius+.007),segments=512
 const p:number[]=[],uv:number[]=[],indices:number[]=[]
 for(let i=0;i<=segments;i++){const s=i/segments*length,[x,y]=beltPoint(s);for(let j=0;j<2;j++){p.push(x,y,(j-.5)*CONVEYOR.beltWidth);uv.push(s/.36,j)}}
 for(let i=0;i<segments;i++){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2)}
 const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(p,3));geometry.setAttribute('uv',new Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry
}
export function beltTexture() {
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')!
 c.fillStyle='#15191a';c.fillRect(0,0,512,512)
 for(let i=-512;i<1024;i+=4){c.strokeStyle=i%8?'#1b2021':'#101516';c.lineWidth=.65;c.beginPath();c.moveTo(i,0);c.lineTo(i+512,512);c.stroke();c.strokeStyle='#222728';c.lineWidth=.4;c.beginPath();c.moveTo(i,512);c.lineTo(i+512,0);c.stroke()}
 const texture=new CanvasTexture(canvas);texture.wrapS=texture.wrapT=RepeatWrapping;texture.colorSpace=SRGBColorSpace;texture.anisotropy=12;return texture
}
export function mountingPlate() {
 const shape=new Shape();shape.moveTo(-.045,-.08);shape.lineTo(.045,-.08);shape.lineTo(.045,.045);shape.lineTo(-.045,.045);shape.closePath()
 const hole=new Path();hole.absarc(0,0,.012,0,TAU,true);shape.holes.push(hole)
 const geo=new ExtrudeGeometry(shape,{depth:.004,bevelEnabled:false,curveSegments:32});return geo
}
