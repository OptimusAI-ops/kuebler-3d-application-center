import { advanceCrane, advanceExtension, CRANE, initialCraneMotion } from './kinematics.ts'
import type { CraneMotion } from './kinematics.ts'
import type { CraneSensor } from './drawWire.ts'
import { craneDemoBoundaries, craneDemoSteps } from './demo.ts'
import { extensionDemoBoundaries, extensionDemoSteps } from './extensionDemo.ts'
export interface CraneDemo {active:boolean;paused:boolean;elapsed:number;step:number;generation:number;mode:'angle'|'extension'}
export interface CraneSnapshot {motion:CraneMotion;demo:CraneDemo;autoCycle:boolean;autoExtension:boolean;principle:boolean;command:-1|0|1;extensionCommand:-1|0|1;internalMechanism:boolean;allSensors:boolean;sensorFocus:CraneSensor}
/** One controller for both crane routes, both motion axes, both measurements and the guide. */
export class CraneController {
 motion=initialCraneMotion()
 demo:CraneDemo={active:false,paused:false,elapsed:0,step:0,generation:0,mode:'angle'}
 autoCycle=false;autoExtension=false;principle=false;internalMechanism=false;allSensors=false
 sensorFocus:CraneSensor='inclinometer'
 command:-1|0|1=0;extensionCommand:-1|0|1=0
 private target:number|null=null
 private extensionTarget:number|null=null
 private cycleTarget=65
 private extensionCycleTarget=8
 private listeners=new Set<()=>void>()
 private snapshot!:CraneSnapshot
 private publishTime=0
 constructor(){this.publish()}
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener)}}
 getSnapshot=()=>this.snapshot
 private publish(){this.snapshot={motion:{...this.motion},demo:{...this.demo},autoCycle:this.autoCycle,autoExtension:this.autoExtension,principle:this.principle,command:this.command,extensionCommand:this.extensionCommand,internalMechanism:this.internalMechanism,allSensors:this.allSensors,sensorFocus:this.sensorFocus};this.listeners.forEach(fn=>fn())}
 private interruptGuide(){if(this.demo.active){this.target=null;this.extensionTarget=null}this.demo={...this.demo,active:false,paused:false}}
 private manualAngle(){this.interruptGuide();this.autoCycle=false;this.command=0;this.target=null}
 private manualExtension(){this.interruptGuide();this.autoExtension=false;this.extensionCommand=0;this.extensionTarget=null}
 hold=(direction:-1|1)=>{this.manualAngle();this.command=direction;this.target=direction===1?75:0;this.publish()}
 release=()=>{if(!this.command)return;this.command=0;this.target=null;this.publish()}
 holdExtension=(direction:-1|1)=>{this.manualExtension();this.extensionCommand=direction;this.extensionTarget=direction===1?8:0;this.publish()}
 releaseExtension=()=>{if(!this.extensionCommand)return;this.extensionCommand=0;this.extensionTarget=null;this.publish()}
 setAngle=(angle:number)=>{if(!Number.isFinite(angle))return;this.manualAngle();this.motion={...this.motion,boomAngleDegrees:Math.max(0,Math.min(75,angle)),angularVelocity:0};this.publish()}
 setExtension=(meters:number)=>{if(!Number.isFinite(meters))return;this.manualExtension();this.motion={...this.motion,boomExtensionMeters:Math.max(0,Math.min(CRANE.maxExtension,meters)),extensionVelocity:0};this.publish()}
 reset=()=>{this.stop();this.motion=initialCraneMotion();this.principle=false;this.internalMechanism=false;this.publish()}
 resetExtension=()=>{this.manualExtension();this.extensionTarget=0;this.publish()}
 toggleCycle=()=>{const start=!this.autoCycle;this.manualAngle();this.autoCycle=start;this.cycleTarget=this.motion.boomAngleDegrees>=65?10:65;this.publish()}
 toggleExtensionCycle=()=>{const start=!this.autoExtension;this.manualExtension();this.autoExtension=start;this.extensionCycleTarget=this.motion.boomExtensionMeters>=7.99?0:8;this.publish()}
 stop=()=>{this.interruptGuide();this.autoCycle=false;this.autoExtension=false;this.command=0;this.extensionCommand=0;this.target=null;this.extensionTarget=null;this.publish()}
 togglePrinciple=()=>{this.principle=!this.principle;this.publish()}
 setFocus=(sensor:CraneSensor)=>{this.sensorFocus=sensor;this.publish()}
 setInternalMechanism=(value:boolean)=>{this.internalMechanism=value;if(value)this.sensorFocus='draw-wire';this.publish()}
 setAllSensors=(value:boolean)=>{this.allSensors=value;this.publish()}
 demoStart=(mode:'angle'|'extension'='angle')=>{
  this.stop();this.motion={...initialCraneMotion(),boomAngleDegrees:mode==='angle'?10:30,boomExtensionMeters:mode==='extension'?0:CRANE.initialExtension}
  this.demo={active:true,paused:false,elapsed:0,step:0,generation:this.demo.generation+1,mode};this.principle=false;this.internalMechanism=false;this.allSensors=false;this.sensorFocus=mode==='angle'?'inclinometer':'draw-wire';this.publish()
 }
 demoExit=()=>{this.stop()}
 demoPause=()=>{if(this.demo.active){this.demo={...this.demo,paused:!this.demo.paused};this.publish()}}
 get demoSteps(){return this.demo.mode==='angle'?craneDemoSteps:extensionDemoSteps}
 private get boundaries(){return this.demo.mode==='angle'?craneDemoBoundaries:extensionDemoBoundaries}
 private enterStep(step:number){
  this.demo={...this.demo,step}
  if(this.demo.mode==='angle'){this.target=step===2||step===5?50:step===6?10:null;return}
  this.target=step===11?45:null
  this.extensionTarget=step===2?3:step===7?6:step===9?0:step===11?2:null
  this.internalMechanism=step===6||step===7
  this.allSensors=step===11
 }
 demoNext=()=>{if(!this.demo.active)return;if(this.demo.step===this.demoSteps.length-1){this.demoExit();return}const next=this.demo.step+1;this.demo={...this.demo,elapsed:this.boundaries[next]};this.enterStep(next);this.publish()}
 get moving(){return Math.abs(this.motion.angularVelocity)>1e-8||Math.abs(this.motion.extensionVelocity)>1e-8||this.command!==0||this.extensionCommand!==0||this.autoCycle||this.autoExtension||(this.extensionTarget!==null&&Math.abs(this.extensionTarget-this.motion.boomExtensionMeters)>1e-8)||(this.demo.active&&!this.demo.paused)}
 tick(seconds:number){
  if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('Invalid frame duration')
  if(this.demo.active&&this.demo.paused)return
  if(!this.moving)return
  let remaining=seconds
  while(remaining>1e-10){
   const boundary=this.demo.active?this.boundaries[this.demo.step+1]-this.demo.elapsed:Infinity
   const dt=Math.min(remaining,1/120,Math.max(1e-10,boundary))
   if(this.autoCycle){if(Math.abs(this.motion.boomAngleDegrees-this.cycleTarget)<.001&&Math.abs(this.motion.angularVelocity)<.001)this.cycleTarget=this.cycleTarget===65?10:65;this.target=this.cycleTarget}
   if(this.autoExtension){if(Math.abs(this.motion.boomExtensionMeters-this.extensionCycleTarget)<1e-6&&Math.abs(this.motion.extensionVelocity)<1e-6)this.extensionCycleTarget=this.extensionCycleTarget===8?0:8;this.extensionTarget=this.extensionCycleTarget}
   this.motion=advanceExtension(advanceCrane(this.motion,dt,this.target),dt,this.extensionTarget)
   if(this.demo.active){
    this.demo={...this.demo,elapsed:this.demo.elapsed+dt}
    if(this.demo.elapsed>=this.boundaries.at(-1)!-1e-8){this.interruptGuide();this.publish()}
    else if(this.demo.elapsed>=this.boundaries[this.demo.step+1]-1e-8){this.enterStep(this.demo.step+1);this.publish()}
   }
   remaining-=dt
  }
  this.publishTime+=seconds
  if(this.publishTime>=.05||!this.moving){this.publishTime=0;this.publish()}
 }
}
