import { advanceCarousel, CAROUSEL, initialCarouselMotion } from './simulation.ts'
import { carouselDemoBoundaries, carouselDemoSteps, CAROUSEL_DEMO_DURATION } from './demo.ts'
export type ComparisonMode='without'|'with'|null
export interface CarouselDemo {active:boolean;paused:boolean;elapsed:number;step:number;generation:number}
export interface CarouselSnapshot {motion:ReturnType<typeof initialCarouselMotion>;power:boolean;signal:boolean;inspecting:boolean;exploded:boolean;explosion:number;comparison:ComparisonMode;directReference:number|null;demo:CarouselDemo;connected:boolean;supplyConnected:boolean;ridePhase:number;cutaway:boolean}
export class CarouselController {
 motion=initialCarouselMotion()
 supplyConnected=true;ridePhase=0;cutaway=false
 power=false;signal=false;inspecting=false;exploded=false;explosion=0
 comparison:ComparisonMode=null
 directReference:number|null=null
 demo:CarouselDemo={active:false,paused:false,elapsed:0,step:0,generation:0}
 private listeners=new Set<()=>void>();private snapshot!:CarouselSnapshot;private publishTime=0
 constructor(){this.publish()}
 subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn)}}
 getSnapshot=()=>this.snapshot
 get connected(){return this.supplyConnected&&!this.exploded&&this.explosion<.001}
 private publish(){this.snapshot={motion:{...this.motion,fillLevels:[...this.motion.fillLevels]},power:this.power,signal:this.signal,inspecting:this.inspecting,exploded:this.exploded,explosion:this.explosion,comparison:this.comparison,directReference:this.directReference,demo:{...this.demo},connected:this.connected,supplyConnected:this.supplyConnected,ridePhase:this.ridePhase,cutaway:this.cutaway};this.listeners.forEach(fn=>fn())}
 private interrupt(){this.demo={...this.demo,active:false,paused:false}}
 setCutaway=(value:boolean)=>{this.cutaway=value;this.publish()}
 setSupplyConnected=(value:boolean)=>{this.interrupt();this.supplyConnected=value;this.publish()}
 start=()=>{this.interrupt();this.motion={...this.motion,running:true};this.publish()}
 stop=()=>{this.interrupt();this.motion={...this.motion,running:false};this.publish()}
 setRPM=(rpm:number)=>{if(!Number.isFinite(rpm))return;this.interrupt();this.motion={...this.motion,targetRPM:Math.max(0,Math.min(CAROUSEL.maxRPM,rpm))};this.publish()}
 reverse=()=>{this.interrupt();this.motion={...this.motion,direction:this.motion.direction===1?-1:1};this.publish()}
 reset=()=>{this.interrupt();this.motion=initialCarouselMotion();this.supplyConnected=true;this.ridePhase=0;this.cutaway=false;this.power=false;this.signal=false;this.inspecting=false;this.exploded=false;this.explosion=0;this.comparison=null;this.directReference=null;this.publish()}
 setInspecting=(value:boolean)=>{this.inspecting=value;if(value){this.power=true;this.signal=true}this.publish()}
 togglePower=()=>{this.power=!this.power;this.publish()}
 toggleSignal=()=>{this.signal=!this.signal;this.publish()}
 toggleExploded=()=>{this.interrupt();this.comparison=null;this.directReference=null;this.exploded=!this.exploded;this.inspecting=true;this.power=true;this.signal=true;this.publish()}
 private without(){this.supplyConnected=true;this.exploded=false;this.explosion=0;this.directReference=this.motion.angleRadians;this.comparison='without';this.inspecting=true;this.power=false;this.signal=false;this.motion={...this.motion,rpm:0,targetRPM:6,direction:1,running:true}}
 private with(){this.supplyConnected=true;this.exploded=false;this.comparison='with';this.directReference=null;this.inspecting=true;this.power=true;this.signal=true;this.motion={...this.motion,targetRPM:6,direction:1,running:true}}
 compareWithout=()=>{this.interrupt();this.without();this.publish()}
 compareWith=()=>{this.interrupt();this.with();this.publish()}
 endComparison=()=>{this.comparison=null;this.directReference=null;this.publish()}
 demoStart=()=>{this.motion=initialCarouselMotion();this.supplyConnected=true;this.ridePhase=0;this.cutaway=false;this.power=false;this.signal=false;this.inspecting=false;this.exploded=false;this.explosion=0;this.comparison=null;this.directReference=null;this.demo={active:true,paused:false,elapsed:0,step:0,generation:this.demo.generation+1};this.publish()}
 demoExit=()=>{this.interrupt();this.motion={...this.motion,running:false};this.publish()}
 demoPause=()=>{if(this.demo.active){this.demo={...this.demo,paused:!this.demo.paused};this.publish()}}
 private enterStep(step:number){this.demo={...this.demo,step};if(step===1)this.motion={...this.motion,running:true};if(step===3)this.inspecting=true;if(step===5)this.power=true;if(step===6)this.signal=true;if(step===7)this.exploded=true;if(step===8)this.without();if(step===9){this.with();this.inspecting=false}}
 demoNext=()=>{if(!this.demo.active)return;if(this.demo.step===carouselDemoSteps.length-1){this.demoExit();return}const step=this.demo.step+1;this.demo={...this.demo,elapsed:carouselDemoBoundaries[step]};this.enterStep(step);this.publish()}
 get active(){return this.motion.running||Math.abs(this.motion.rpm)>1e-8||this.power||this.signal||Math.abs(this.explosion-(this.exploded?1:0))>.001||this.demo.active}
 tick(seconds:number){
  if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('Invalid duration')
  if(this.demo.active&&this.demo.paused)return
  if(!this.active)return
  let remaining=seconds
  while(remaining>1e-10){
   const boundary=this.demo.active?carouselDemoBoundaries[this.demo.step+1]-this.demo.elapsed:Infinity,dt=Math.min(remaining,1/120,Math.max(1e-10,boundary))
   this.explosion+=(this.exploded?1-this.explosion:-this.explosion)*(1-Math.exp(-6*dt));if(this.explosion<.0005)this.explosion=0;if(this.explosion>.9995)this.explosion=1
   if(this.connected)this.ridePhase+=Math.abs(this.motion.rpm)*Math.PI*2/60*2.4*dt
   this.motion=advanceCarousel(this.motion,dt,this.connected,this.directReference)
   if(this.demo.active){this.demo={...this.demo,elapsed:this.demo.elapsed+dt};if(this.demo.elapsed>=CAROUSEL_DEMO_DURATION-1e-8){this.interrupt();this.publish()}else if(this.demo.elapsed>=carouselDemoBoundaries[this.demo.step+1]-1e-8){this.enterStep(this.demo.step+1);this.publish()}}
   remaining-=dt
  }
  this.publishTime+=seconds;if(this.publishTime>=.05||!this.active){this.publishTime=0;this.publish()}
 }
}
