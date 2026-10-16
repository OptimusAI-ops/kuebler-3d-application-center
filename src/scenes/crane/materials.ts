import { CanvasTexture, MeshPhysicalMaterial, MeshStandardMaterial, SRGBColorSpace } from 'three'
import { buildConveyorMaterials } from '../../conveyor/materials'
function label(text:string,background:string,foreground:string,width=1024,height=256){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d')!;c.fillStyle=background;c.fillRect(0,0,width,height);c.fillStyle=foreground;c.font=`bold ${height*.3}px Arial`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,width/2,height/2);const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;map.anisotropy=8;return map}
function productLabel(name:string,subtitle:string){const c=document.createElement('canvas');c.width=768;c.height=768;const x=c.getContext('2d')!;x.fillStyle='#edeee5';x.fillRect(0,0,768,768);x.fillStyle='#e97e32';x.fillRect(0,0,768,25);x.fillRect(0,743,768,25);x.fillStyle='#243034';x.font='bold 105px Arial';x.fillText('Kübler',42,145);x.font='bold 72px Arial';x.fillText(name,42,255);x.font='36px Arial';x.fillText(subtitle,42,335);x.font='29px Arial';x.fillText('APPLICATION REFERENCE',42,420);x.font='28px Arial';x.fillText('MEASUREMENT SYSTEM',42,470);x.strokeStyle='#243034';x.lineWidth=7;x.beginPath();x.arc(560,595,65,.1,Math.PI*1.6);x.stroke();x.beginPath();x.moveTo(592,524);x.lineTo(620,558);x.lineTo(578,556);x.fill();const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;t.anisotropy=8;return t}
export function buildCraneMaterials(){
 const common=buildConveyorMaterials()
 const yellow=common.paint.clone();yellow.color.set('#e6b64c');yellow.roughness=.34;yellow.clearcoat=.32
 const dark=common.paint.clone();dark.color.set('#263136')
 const cream=common.paint.clone();cream.color.set('#e2e2d6')
 const orange=common.paint.clone();orange.color.set('#eb772e')
 const glass=new MeshPhysicalMaterial({color:'#25414e',metalness:.25,roughness:.12,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.25})
 const lamp=new MeshPhysicalMaterial({color:'#e4edf0',metalness:.2,roughness:.14,clearcoat:1})
 const red=new MeshStandardMaterial({color:'#a83220',roughness:.32,metalness:.25})
 const brandMap=label('MOBILE / 02','#d9ae49','#263136')
 const brand=new MeshStandardMaterial({map:brandMap,roughness:.55,metalness:.1})
 const sensorMap=productLabel('IN88','INCLINATION / CANopen')
 const sensorLabel=new MeshStandardMaterial({map:sensorMap,roughness:.58})
 const drawMap=productLabel('D125','DRAW-WIRE ENCODER')
 const drawLabel=new MeshStandardMaterial({map:drawMap,roughness:.65})
 const drawHousing=dark.clone();drawHousing.color.set('#151c20');drawHousing.roughness=.53
 const cutawayHousing=drawHousing.clone();cutawayHousing.transparent=true;cutawayHousing.opacity=.14;cutawayHousing.depthWrite=false
 const sensorMetal=common.aluminium.clone();sensorMetal.roughness=.56;sensorMetal.metalness=.72;sensorMetal.color.set('#aeb8b8')
 const drawPCB=new MeshStandardMaterial({color:'#285a48',metalness:.1,roughness:.6})
 const owned=[sensorMetal,drawPCB,drawLabel,drawHousing,cutawayHousing,yellow,dark,cream,orange,glass,lamp,red,brand,sensorLabel]
 return {...common,yellow,dark,cream,orange,glass,lamp,red,brand,sensorLabel,drawLabel,drawHousing,cutawayHousing,drawPCB,sensorMetal,dispose:()=>{common.dispose();owned.forEach(m=>m.dispose());brandMap.dispose();sensorMap.dispose();drawMap.dispose()}}
}
export type CraneMaterials=ReturnType<typeof buildCraneMaterials>
