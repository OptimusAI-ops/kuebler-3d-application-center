import { CanvasTexture, Color, MeshPhysicalMaterial, MeshStandardMaterial, SRGBColorSpace } from 'three'
import { buildConveyorMaterials } from '../../conveyor/materials'
function label(lines:string[],background:string,color:string,width=1024,height=512){const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d')!;x.fillStyle=background;x.fillRect(0,0,width,height);x.fillStyle=color;x.textAlign='center';x.textBaseline='middle';x.font=`bold ${height/(lines.length*2.2)}px Arial`;lines.forEach((t,i)=>x.fillText(t,width/2,height*(i+.5)/lines.length));const map=new CanvasTexture(c);map.colorSpace=SRGBColorSpace;map.anisotropy=8;return map}
export function buildCarouselMaterials(){
 const common=buildConveyorMaterials(),steel=common.aluminium.clone();steel.color.set('#bdc6c7');steel.roughness=.34;steel.metalness=.95
 const structure=common.paint.clone();structure.color.set('#405557')
 const sensorSteel=common.steel.clone(),sensorBlack=new MeshStandardMaterial({color:'#20262a',roughness:.44,metalness:.2})
 const sensorRed=new MeshPhysicalMaterial({color:'#be3f32',roughness:.38,metalness:.14,clearcoat:.25})
 const clearRed=sensorRed.clone();clearRed.transparent=true;clearRed.opacity=.15;clearRed.depthWrite=false
 const sensorGhost=sensorBlack.clone();sensorGhost.transparent=true;sensorGhost.opacity=.13;sensorGhost.depthWrite=false
 const contact=new MeshStandardMaterial({color:'#c19b51',metalness:.92,roughness:.28}),signalContact=new MeshStandardMaterial({color:'#dce2dc',metalness:.95,roughness:.21})
 const cyan=new MeshStandardMaterial({color:'#74d0df',emissive:'#40a3bc',emissiveIntensity:.7,roughness:.34}),amber=new MeshStandardMaterial({color:'#ffc075',emissive:'#c57b2a',emissiveIntensity:.7,roughness:.34})
 const bottle=new MeshPhysicalMaterial({color:'#d1e6e9',transparent:true,opacity:.24,roughness:.12,metalness:0,clearcoat:1,depthWrite:false})
 const liquid=new MeshPhysicalMaterial({color:'#54a6b1',roughness:.22,metalness:0,clearcoat:.8})
 const guard=new MeshPhysicalMaterial({color:'#c3dde1',transparent:true,opacity:.12,roughness:.1,metalness:0,depthWrite:false})
 const green=new MeshStandardMaterial({color:'#4dac81',emissive:'#1a6e48',emissiveIntensity:.5,roughness:.3})
 const screenMap=label(['ROTARY FILL / 04','LOCAL DEMONSTRATION','POWER  •  CONTROL'], '#172f36','#93c6c9'),screen=new MeshStandardMaterial({map:screenMap,emissive:'#1c4148',emissiveIntensity:.25,roughness:.45})
 const bottleMap=label(['PROCESS','DEMO'], '#d6e1df','#364d54'),bottleLabel=new MeshStandardMaterial({map:bottleMap,roughness:.7})
 const sensorMap=label(['Kübler','SR085 family'], '#e7e8df','#314044'),sensorLabel=new MeshStandardMaterial({map:sensorMap,roughness:.6})
 const dimmable=[steel,structure,common.paint,common.rubber,common.aluminium,common.steel],base=dimmable.map(m=>m.color.clone())
 const owned=[steel,structure,sensorSteel,sensorBlack,sensorRed,clearRed,sensorGhost,contact,signalContact,cyan,amber,bottle,liquid,guard,green,screen,bottleLabel,sensorLabel]
 return {...common,stainless:steel,structure,sensorSteel,sensorBlack,sensorRed,clearRed,sensorGhost,contact,signalContact,cyan,amber,bottle,liquid,guard,green,screen,bottleLabel,sensorLabel,dim:(value:boolean)=>{dimmable.forEach((m,i)=>m.color.copy(base[i]).multiply(new Color(value?.66:1,value?.66:1,value?.66:1)))},dispose:()=>{common.dispose();owned.forEach(m=>m.dispose());[screenMap,bottleMap,sensorMap].forEach(t=>t.dispose())}}
}
export type CarouselMaterials=ReturnType<typeof buildCarouselMaterials>
