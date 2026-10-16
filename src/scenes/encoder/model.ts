import { axialSector } from './section'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { finish } from './finishes'
/** Exterior geometry adapted from the existing photo-based encoder teaching model.
 * Units are mm. Only the external shaft, flange, enclosure and connector are reused.
 * This generic training exterior is not a certified CAD model or exact configured part. */
export function buildEncoderExterior() {
 const root=new THREE.Group(), stationary=new THREE.Group(), rotor=new THREE.Group()
 root.add(stationary,rotor)
 const silver=finish(new THREE.MeshStandardMaterial({color:'#a4aeb3',metalness:.94,roughness:.24}),'turned')
 const shell=finish(new THREE.MeshStandardMaterial({color:'#b6bfc0',metalness:.94,roughness:.28}),'brushed')
 const dark=new THREE.MeshStandardMaterial({color:'#1d262b',roughness:.7})
 const orange=new THREE.MeshStandardMaterial({color:'#ed803c',metalness:.2,roughness:.4})
 function mesh(g:THREE.Group,geometry:THREE.BufferGeometry,material:THREE.Material,x=0,y=0,z=0) {const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
 function cylinder(g:THREE.Group,r:number,depth:number,z:number,mat:THREE.Material,x=0,y=0){const geo=new THREE.CylinderGeometry(r,r,depth,64);geo.rotateX(Math.PI/2);return mesh(g,geo,mat,x,y,z)}
 function ring(outer:number,inner:number,depth:number) {
  const s=new THREE.Shape();s.absarc(0,0,outer,0,Math.PI*2,false)
  const h=new THREE.Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h)
  const geo=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:48});geo.translate(0,0,-depth/2);return geo
 }
 // Exterior dimensions and axial stack retained from the original teaching model.
 cylinder(rotor,5,32,10,silver);cylinder(rotor,5,20,36,silver)
 mesh(rotor,new THREE.BoxGeometry(.25,1,15),orange,5,0,35)
 mesh(stationary,ring(12,5.2,1.5),dark,0,0,24)
 mesh(stationary,ring(29,12,5.5),silver,0,0,18.5)
 mesh(stationary,ring(18,5.2,5),silver,0,0,23.5)
 const housing=mesh(stationary,ring(29,27.6,30.5),shell,0,0,-1.8)
 const rearCap=cylinder(stationary,28.7,1.8,-18.2,silver)
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3+.4;cylinder(stationary,2,1,-19.4,silver,23*Math.cos(a),23*Math.sin(a));cylinder(stationary,.95,.2,-20,dark,23*Math.cos(a),23*Math.sin(a))}
 for(const r of [24,25.5,26.8])mesh(stationary,new THREE.TorusGeometry(r,.08,6,72),silver,0,0,-19.2)
 for(const z of [-17.3,13.5]) mesh(stationary,new THREE.TorusGeometry(28.8,.3,8,64),silver,0,0,z)
 for(let i=0;i<3;i++) {const a=i*Math.PI*2/3+Math.PI/6;cylinder(stationary,2.3,1.8,22.3,dark,24.2*Math.cos(a),24.2*Math.sin(a))}
 // Curved label construction with the referenced product family.
 const label=document.createElement('canvas');label.width=768;label.height=384
 const ctx=label.getContext('2d')!;ctx.fillStyle='#e4e5dd';ctx.fillRect(0,0,768,384);ctx.fillStyle='#ed803c';ctx.fillRect(0,325,768,59)
 ctx.fillStyle='#172126';ctx.font='bold 100px Arial';ctx.fillText('KÜBLER',32,116);ctx.font='43px Arial';ctx.fillText('SENDIX KIS50',32,192);ctx.font='27px Arial';ctx.fillText('APPLICATION MODEL',32,260)
 const texture=new THREE.CanvasTexture(label);texture.colorSpace=THREE.SRGBColorSpace
 const labelMaterial=new THREE.MeshStandardMaterial({map:texture,roughness:.8,side:THREE.DoubleSide})
 const positions:number[]=[],uv:number[]=[],indices:number[]=[]
 for(let i=0;i<=64;i++){const a=.5+i/64*1.8;for(let j=0;j<2;j++){positions.push(29.15*Math.cos(a),29.15*Math.sin(a),j?10.5:-14);uv.push(i/64,j)}}
 for(let i=0;i<64;i++){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals()
 const printedLabel=mesh(stationary,geo,labelMaterial)
 // Stationary radial electrical connector, oriented upward after installation.
 const connector=new THREE.Group();connector.position.set(-29,0,-3);connector.rotation.y=-Math.PI/2;stationary.add(connector)
 mesh(connector,new RoundedBoxGeometry(20,22,5,2,.8),silver,0,0,2)
 cylinder(connector,9.5,14,10,silver);cylinder(connector,7.8,8,20,dark)
 for(let i=0;i<7;i++) mesh(connector,new THREE.TorusGeometry(9.6,.2,6,48),silver,0,0,4+i*1.7)
 // Exterior proportions follow the Sendix KIS50 reference. The optical construction
 // is a functional illustration: track count and PCB layout are not manufacturer CAD.
 const internal=new THREE.Group(),diskAssembly=new THREE.Group(),sectioned=new THREE.Group()
 stationary.add(internal,sectioned);rotor.add(diskAssembly)
 const pcb=new THREE.MeshStandardMaterial({color:'#1e6150',roughness:.55,metalness:.18})
 const chip=new THREE.MeshStandardMaterial({color:'#1b2024',roughness:.65}),gold=new THREE.MeshStandardMaterial({color:'#bda56d',metalness:.8,roughness:.3})
 const diskMaterial=new THREE.MeshStandardMaterial({color:'#b7bec1',metalness:.65,roughness:.28})
 mesh(sectioned,axialSector(29,27.6,30.5,Math.PI*.7,Math.PI*.6),shell,0,0,-1.8)
 mesh(sectioned,axialSector(28.7,0,1.8,Math.PI*.7,Math.PI*.6),silver,0,0,-18.2)
 mesh(internal,axialSector(24,6,1.2,Math.PI/2,Math.PI),pcb,0,0,-12.8)
 mesh(diskAssembly,ring(23,5,0.55),diskMaterial,0,0,-3.5)
 const slots=new THREE.InstancedMesh(new THREE.BoxGeometry(4,.45,.12),dark,96),matrix=new THREE.Matrix4()
 for(let i=0;i<96;i++){const a=i*Math.PI*2/96;matrix.makeRotationZ(a);matrix.setPosition(Math.cos(a)*19,Math.sin(a)*19,-3.83);slots.setMatrixAt(i,matrix)}diskAssembly.add(slots)
 for(const z of [-10,12]){mesh(internal,ring(10,5.1,4),silver,0,0,z);mesh(internal,ring(8.8,5.2,4.1),dark,0,0,z)}
 for(const [x,y,w,h] of [[-15,-12,6,5],[-14,11,6,6],[-20,0,4,5],[-9,5,5,5]])mesh(internal,new THREE.BoxGeometry(w,h,2),chip,x,y,-10.8)
 for(let i=0;i<8;i++)mesh(internal,new THREE.BoxGeometry(2,.7,.4),gold,-17+i*1.3,5,-11.8)
 // A fixed optical fork straddles the disk; only disk and shaft rotate.
 mesh(internal,new THREE.BoxGeometry(4,6,11),chip,25,0,-3.5)
 mesh(internal,new THREE.BoxGeometry(10,6,2),chip,20,0,-8)
 mesh(internal,new THREE.BoxGeometry(10,6,2),chip,20,0,1)
 mesh(internal,new THREE.BoxGeometry(4,4,1),orange,17,0,-6.2)
 mesh(internal,new THREE.BoxGeometry(4,4,1),chip,17,0,-.5)
 const beam=mesh(internal,new THREE.CylinderGeometry(.45,.45,5.7,12),new THREE.MeshBasicMaterial({color:'#ffac63',transparent:true,opacity:.7}),17,0,-3.35);beam.rotation.x=Math.PI/2
 const cutaway=(enabled:boolean)=>{housing.visible=!enabled;rearCap.visible=!enabled;printedLabel.visible=!enabled;sectioned.visible=enabled;internal.visible=enabled;diskAssembly.visible=enabled}
 cutaway(false)
 const dispose=()=>{const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();root.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);if(Array.isArray(o.material))o.material.forEach(m=>materials.add(m));else materials.add(o.material)}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());texture.dispose()}
 return {root,rotor,cutaway,dispose}
}
