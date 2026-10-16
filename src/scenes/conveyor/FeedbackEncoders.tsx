import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, ExtrudeGeometry, Path, Shape, Vector3 } from 'three'
import type { Group } from 'three'
import { buildEncoderExterior } from '../encoder/model'
import { AxialCylinder, Bolt, MetalBox } from './Hardware'
import { IntegratedMotorFeedback } from './IntegratedMotorFeedback'
import type { ConveyorMaterials } from '../../conveyor/materials'
import type { ConveyorController } from '../../conveyor/controller'
import { FEEDBACK, conveyorSensors } from '../../conveyor/feedback'
import type { ConveyorSensor } from '../../conveyor/feedback'
function armGeometry(){
 const s=new Shape();s.moveTo(-.035,-.035);s.quadraticCurveTo(.045,-.045,.045,.01);s.quadraticCurveTo(.04,.04,.015,.045);s.lineTo(-.138,.113);s.quadraticCurveTo(-.195,.125,-.198,.08);s.quadraticCurveTo(-.195,.048,-.16,.045);s.lineTo(-.035,-.035)
 for(const [x,y,r] of [[0,0,.0255],[-.16,.08,.017]]){const h=new Path();h.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(h)}
 return new ExtrudeGeometry(s,{depth:.01,bevelEnabled:true,bevelSegments:2,bevelSize:.001,bevelThickness:.001,curveSegments:24})
}
export function FeedbackEncoders({controller,m,focus,cutaway,onSelect}:{controller:ConveyorController;m:ConveyorMaterials;focus:ConveyorSensor;cutaway:boolean;onSelect?:(sensor:ConveyorSensor)=>void}){
 const wheel=useRef<Group>(null),encoder=useMemo(buildEncoderExterior,[])
 const resources=useMemo(()=>{
  const spring=(z:number)=>new CatmullRomCurve3(Array.from({length:161},(_,i)=>{const t=i/160,a=t*Math.PI*2*10;return new Vector3(-.78+t*.085,1.335-t*.043+Math.sin(a)*.005,z+Math.cos(a)*.005)}))
  return {arm:armGeometry(),springs:[spring(.45),spring(.48)],cable:new CatmullRomCurve3([new Vector3(-.621,1.265,.452),new Vector3(-.55,1.29,.56),new Vector3(-.48,1.12,.6),new Vector3(-.9,.8,.61)])}
 },[])
 useEffect(()=>{encoder.cutaway(cutaway&&focus==='wheel')},[encoder,cutaway,focus])
 useEffect(()=>()=>{encoder.dispose();resources.arm.dispose()},[encoder,resources])
 useFrame(()=>{if(wheel.current)wheel.current.rotation.z=-controller.motion.beltTravel/(FEEDBACK.wheelCircumference/(Math.PI*2));encoder.rotor.rotation.z=controller.motion.beltTravel/FEEDBACK.wheelCircumference*Math.PI*2})
 const click=(sensor:ConveyorSensor)=>(e:{stopPropagation:()=>void})=>{e.stopPropagation();onSelect?.(sensor)}
 return <group>
  <group onClick={click('wheel')}>
   {/* MWE60-style spring arm and L bracket, on the outer frame. The arm carries the flange, not the cable connector. */}
   <MetalBox position={[-.81,1.185,.55]} size={[.074,.39,.014]} material={m.aluminium}/>
   <MetalBox position={[-.81,.99,.585]} size={[.074,.014,.085]} material={m.aluminium}/>
   {[-.023,.023].map(dx=><Bolt key={dx} position={[-.81+dx,.998,.6]} rotation={[-Math.PI/2,0,0]} radius={.005} material={m.steel}/>)}
   <AxialCylinder position={[-.81,1.34475,.45]} radius={.035} depth={.084} material={m.aluminium}/>
   {[.412,.49].map(z=><AxialCylinder key={z} position={[-.81,1.34475,z]} radius={.035} depth={.006} material={m.steel}/>)}
   <AxialCylinder position={[-.81,1.34475,.49]} radius={.009} depth={.16} material={m.steel}/>
   <Bolt position={[-.81,1.34475,.566]} radius={.009} material={m.steel}/>
   <Bolt position={[-.81,1.34475,.503]} radius={.009} material={m.steel}/>
   <mesh position={[-.65,1.26475,.412]} geometry={resources.arm} material={m.aluminium} castShadow receiveShadow/>
   {resources.springs.map((curve,i)=><group key={i}><mesh material={m.steel} castShadow><tubeGeometry args={[curve,160,.0014,6,false]}/></mesh>{[[-.78,1.335],[-.695,1.292]].map(([x,y])=><group key={x}><AxialCylinder position={[x,y,i===0?.435:.45]} radius={.0035} depth={i===0?.03:.06} material={m.steel}/><Bolt position={[x,y,i===0?.45:.48]} radius={.0035} material={m.steel}/></group>)}</group>)}
   <group position={conveyorSensors.wheel.location} ref={wheel}>
    <AxialCylinder radius={FEEDBACK.wheelCircumference/(Math.PI*2)-.0027} depth={.019} material={m.aluminium}/>
    <AxialCylinder radius={.0418} depth={.021} material={m.steel}/>
    <AxialCylinder radius={.0398} depth={.022} material={m.aluminium}/>
    {[-.006,.006].map(z=><mesh key={z} position={[0,0,z]} material={m.rubber} castShadow><torusGeometry args={[FEEDBACK.wheelCircumference/(Math.PI*2)-.0025,.0025,12,72]}/></mesh>)}
    <AxialCylinder radius={.009} depth={.03} material={m.steel}/>
    <Bolt position={[0,0,-.016]} rotation={[0,Math.PI,0]} radius={.009} material={m.steel}/>
    {[.017,.039].map(r=><mesh key={r} position={[0,0,-.0113]} material={m.steel}><torusGeometry args={[r,.0003,6,64]}/></mesh>)}
   </group>
   <AxialCylinder position={[-.65,1.26475,.388]} radius={.005} depth={.076} material={m.steel}/>
   <mesh position={[-.65,1.26475,.4255]} material={m.steel}><torusGeometry args={[.0275,.0027,8,64]}/></mesh>
   <primitive object={encoder.root} position={[-.65,1.26475,.449]} rotation={[0,Math.PI,0]} scale={.001} dispose={null}/>
   {[0,1,2].map(i=>{const a=i*Math.PI*2/3;return <Bolt key={i} position={[-.65+Math.cos(a)*.024,1.26475+Math.sin(a)*.024,.427]} rotation={[0,Math.PI,0]} radius={.003} material={m.steel}/>})}
   <mesh material={m.rubber}><tubeGeometry args={[resources.cable,40,.003,8,false]}/></mesh>
  </group>
  <group onClick={click('motor')}><IntegratedMotorFeedback controller={controller} m={m} sectioned={cutaway&&focus==='motor'}/></group>
 </group>
}
