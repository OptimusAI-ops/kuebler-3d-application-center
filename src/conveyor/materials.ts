import { CanvasTexture, MeshPhysicalMaterial, MeshStandardMaterial, NoColorSpace, RepeatWrapping, SRGBColorSpace } from 'three'
import type { Texture, Material } from 'three'
function seeded(seed:number){return()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296}}
function canvas(size:number){const element=document.createElement('canvas');element.width=element.height=size;return {element,context:element.getContext('2d')!}}
function texture(element:HTMLCanvasElement,color=true,repeat=1){const map=new CanvasTexture(element);map.colorSpace=color?SRGBColorSpace:NoColorSpace;map.wrapS=map.wrapT=RepeatWrapping;map.repeat.set(repeat,repeat);map.anisotropy=8;return map}
function noise(size:number,base:number,variation:number,seed:number,color=false){const {element,context}=canvas(size),image=context.createImageData(size,size),random=seeded(seed);for(let i=0;i<image.data.length;i+=4){const value=base+(random()-.5)*variation;image.data[i]=value;image.data[i+1]=value;image.data[i+2]=value;image.data[i+3]=255}context.putImageData(image,0,0);return texture(element,color)}
export function buildConveyorMaterials(){
 const ownedMaps:Texture[]=[],ownedMaterials:Material[]=[]
 const ownMap=<T extends Texture>(map:T)=>{ownedMaps.push(map);return map}
 const own=<T extends Material>(material:T)=>{ownedMaterials.push(material);return material}
 const micro=ownMap(noise(512,160,75,41)),powder=ownMap(noise(512,230,18,84)),paperNoise=ownMap(noise(1024,165,90,18))
 const {element:metalCanvas,context:metalContext}=canvas(1024),random=seeded(23)
 metalContext.fillStyle='#a4a4a4';metalContext.fillRect(0,0,1024,1024)
 for(let i=0;i<4800;i++){const y=random()*1024;metalContext.strokeStyle=`rgba(${random()>.5?'255,255,255':'0,0,0'},${.02+random()*.09})`;metalContext.lineWidth=.3+random()*.7;metalContext.beginPath();metalContext.moveTo(random()*200,y);metalContext.lineTo(800+random()*224,y+random()*1.6);metalContext.stroke()}
 const brushed=ownMap(texture(metalCanvas,false))
 const aluminium=own(new MeshPhysicalMaterial({color:'#a2adb2',metalness:.94,roughness:.36,roughnessMap:brushed,bumpMap:brushed,bumpScale:.00013,clearcoat:.12,clearcoatRoughness:.34}))
 const steel=own(new MeshStandardMaterial({color:'#c4c8c6',metalness:.97,roughness:.3,roughnessMap:brushed,bumpMap:brushed,bumpScale:.00008}))
 const paint=own(new MeshPhysicalMaterial({color:'#35454a',metalness:.5,roughness:.38,roughnessMap:powder,bumpMap:powder,bumpScale:.00007,clearcoat:.2,clearcoatRoughness:.4}))
 const motor=own(new MeshPhysicalMaterial({color:'#24444f',metalness:.5,roughness:.42,roughnessMap:powder,bumpMap:powder,bumpScale:.0001,clearcoat:.15}))
 const bearing=own(new MeshStandardMaterial({color:'#283c35',metalness:.44,roughness:.4,roughnessMap:micro,bumpMap:micro,bumpScale:.0003}))
 const rubber=own(new MeshStandardMaterial({color:'#141819',metalness:0,roughness:.91,roughnessMap:micro,bumpMap:micro,bumpScale:.00035}))
 const recess=own(new MeshStandardMaterial({color:'#131a1d',metalness:.25,roughness:.66}))
 const {element:paper,context:p}=canvas(1024),rng=seeded(66)
 p.fillStyle='#9a754c';p.fillRect(0,0,1024,1024)
 for(let i=0;i<75000;i++){const light=rng()>.5;p.fillStyle=`rgba(${light?'232,210,164':'60,43,25'},${.025+rng()*.06})`;p.fillRect(rng()*1024,rng()*1024,.4+rng()*2,.4+rng()*2)}
 for(let x=0;x<1024;x+=7){p.fillStyle='rgba(50,35,20,.025)';p.fillRect(x,0,1,1024)}
 p.strokeStyle='#5b442b44';p.lineWidth=2;p.strokeRect(7,7,1010,1010)
 const cardboardMap=ownMap(texture(paper)),cardboard=own(new MeshStandardMaterial({map:cardboardMap,color:'#e1c9a5',roughness:.94,bumpMap:paperNoise,bumpScale:.00045,metalness:0}))
 const tape=own(new MeshPhysicalMaterial({color:'#c4a575',metalness:0,roughness:.42,clearcoat:.7,clearcoatRoughness:.34,transparent:true,opacity:.88,bumpMap:paperNoise,bumpScale:.00006}))
 const {element:label,context:l}=canvas(1024)
 l.fillStyle='#ecebe3';l.fillRect(0,0,1024,1024);l.strokeStyle='#424444';l.lineWidth=5;l.strokeRect(32,32,960,960)
 l.fillStyle='#202829';l.font='bold 66px Arial';l.fillText('INDUSTRIAL LOGISTICS',58,115);l.font='42px Arial';l.fillText('APPLICATION CENTER / TRANSFER 01',58,183)
 l.fillRect(52,219,920,5);l.font='bold 100px Arial';l.fillText('04 / A-0184',58,348);l.font='38px monospace';l.fillText('TRAINING PARCEL · RECIRCULATING',58,423)
 let x=65;while(x<950){const width=(1+Math.floor(rng()*4))*3;l.fillRect(x,495,width,285);x+=width+(1+Math.floor(rng()*3))*3}
 l.font='44px monospace';l.fillText('0 184 026 01',285,855);l.font='31px Arial';l.fillText('DEMONSTRATION LABEL — NO SHIPPING VALUE',58,937)
 const labelMap=ownMap(texture(label)),labelMaterial=own(new MeshStandardMaterial({map:labelMap,roughness:.77,metalness:0}))
 const {element:concrete,context:c}=canvas(1024),crng=seeded(92)
 c.fillStyle='#707b83';c.fillRect(0,0,1024,1024)
 for(let i=0;i<90000;i++){c.fillStyle=`rgba(${crng()>.5?'222,222,210':'20,28,26'},${crng()*.075})`;const r=crng()*2.5;c.fillRect(crng()*1024,crng()*1024,r,r)}
 for(let i=0;i<25;i++){const cx=crng()*1024,cy=crng()*1024,g=c.createRadialGradient(cx,cy,0,cx,cy,50+crng()*120);g.addColorStop(0,'#25312c16');g.addColorStop(1,'#25312c00');c.fillStyle=g;c.fillRect(cx-180,cy-180,360,360)}
 const concreteMap=ownMap(texture(concrete,true,12)),concreteBump=ownMap(noise(512,128,110,24));concreteBump.repeat.set(48,48)
 const floor=own(new MeshStandardMaterial({map:concreteMap,color:'#c8d2d8',roughness:.78,bumpMap:concreteBump,bumpScale:.0008,metalness:.03}))
 return {aluminium,steel,paint,motor,bearing,rubber,recess,cardboard,tape,labelMaterial,floor,dispose:()=>{ownedMaps.forEach(t=>t.dispose());ownedMaterials.forEach(m=>m.dispose())}}
}
export type ConveyorMaterials=ReturnType<typeof buildConveyorMaterials>
