/** Illustrative filling machine, SI units. Demo RPM is not a slip-ring product limit. */
export const TAU=2*Math.PI
export const CAROUSEL={stations:12,pitchRadius:.98,deckY:1,headY:1.43,fillStart:Math.PI/6,fillEnd:Math.PI*5/6,conveyorPhase:1.45,maxRPM:12,accelerationRPM:3,sensor:[0,1.85,0] as [number,number,number],directCableLimit:Math.PI/2} as const
export interface CarouselMotion {angleRadians:number;totalRadians:number;rpm:number;targetRPM:number;direction:1|-1;running:boolean;elapsed:number;fillLevels:number[]}
export function wrap(value:number){const r=((value%TAU)+TAU)%TAU;return Math.min(r,TAU-r)<1e-10?0:r}
export function bottlePhase(angle:number,index:number){return wrap(angle+index*TAU/CAROUSEL.stations)}
export function bottlePath(angle:number,index:number){
 const phase=bottlePhase(angle,index),r=CAROUSEL.pitchRadius
 if(phase<=Math.PI)return {position:[r*Math.cos(phase),CAROUSEL.deckY,-r*Math.sin(phase)] as [number,number,number],stage:'carousel' as const,visible:true,phase}
 if(phase<Math.PI+CAROUSEL.conveyorPhase)return {position:[-r,CAROUSEL.deckY,r*(phase-Math.PI)] as [number,number,number],stage:'outfeed' as const,visible:true,phase}
 if(phase>TAU-CAROUSEL.conveyorPhase)return {position:[r,CAROUSEL.deckY,r*(TAU-phase)] as [number,number,number],stage:'infeed' as const,visible:true,phase}
 return {position:[0,0,0] as [number,number,number],stage:'recirculating' as const,visible:false,phase}
}
export function initialCarouselMotion():CarouselMotion{return {angleRadians:0,totalRadians:0,rpm:0,targetRPM:6,direction:1,running:false,elapsed:0,fillLevels:Array.from({length:CAROUSEL.stations},(_,i)=>{const p=bottlePhase(0,i);return p<=Math.PI?Math.max(0,Math.min(1,(p-CAROUSEL.fillStart)/(CAROUSEL.fillEnd-CAROUSEL.fillStart))):p<Math.PI+CAROUSEL.conveyorPhase?1:0})}}
export function advanceCarousel(input:CarouselMotion,seconds:number,connected=true,directReference:number|null=null):CarouselMotion {
 if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('A finite nonnegative duration is required')
 let s={...input,fillLevels:[...input.fillLevels]},remaining=seconds
 while(remaining>1e-10){
  const dt=Math.min(remaining,1/120)
  let goal=s.running?s.targetRPM*s.direction:0
  if(directReference!==null&&s.running){const distance=Math.max(0,CAROUSEL.directCableLimit-s.direction*(s.angleRadians-directReference)),brakingRPM=Math.sqrt(2*(CAROUSEL.accelerationRPM*TAU/60)*distance)*60/TAU;goal=s.direction*Math.min(Math.abs(goal),brakingRPM)}
  const rampTarget=s.rpm*goal<0?0:goal,difference=rampTarget-s.rpm
  const newRPM=s.rpm+Math.max(-CAROUSEL.accelerationRPM*dt,Math.min(CAROUSEL.accelerationRPM*dt,difference))
  let delta=(s.rpm+newRPM)*.5*TAU/60*dt,angle=s.angleRadians+delta,running=s.running,rpm=Math.abs(newRPM)<1e-9?0:newRPM
  if(directReference!==null&&Math.abs(angle-directReference)>=CAROUSEL.directCableLimit-1e-8){angle=directReference+Math.sign(angle-directReference)*CAROUSEL.directCableLimit;delta=angle-s.angleRadians;rpm=0;running=false}
  for(let i=0;i<CAROUSEL.stations;i++){
   const path=bottlePath(angle,i),before=bottlePhase(s.angleRadians,i)
   if(!path.visible||(delta>0&&path.phase<before))s.fillLevels[i]=0
   if(connected&&delta>0&&s.direction===1){
    const inside=Math.max(0,Math.min(path.phase,CAROUSEL.fillEnd)-Math.max(before,CAROUSEL.fillStart))
    s.fillLevels[i]=Math.min(1,s.fillLevels[i]+inside/(CAROUSEL.fillEnd-CAROUSEL.fillStart))
   }
  }
  s={...s,angleRadians:angle,totalRadians:s.totalRadians+Math.abs(delta),rpm,running,elapsed:s.elapsed+dt}
  remaining-=dt
 }
 return s
}
export function carouselReadout(state:CarouselMotion){return {speed:Math.abs(state.rpm),degrees:wrap(state.angleRadians)*180/Math.PI,totalRevolutions:state.totalRadians/TAU,netRevolutions:state.angleRadians/TAU,direction:Math.abs(state.rpm)<1e-8?'Stopped':state.rpm>0?'Forward':'Reverse',operating:Math.abs(state.rpm)>1e-8?'Running':'Stopped'}}
/** Y-axis rotation used by machine rotor, electrical output and bottle holders. */
export function rotatePoint(point:[number,number,number],angle:number):[number,number,number]{return [point[0]*Math.cos(angle)+point[2]*Math.sin(angle),point[1],-point[0]*Math.sin(angle)+point[2]*Math.cos(angle)]}
