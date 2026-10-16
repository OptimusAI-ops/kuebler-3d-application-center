import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceCarousel, bottlePath, CAROUSEL, carouselReadout, initialCarouselMotion, rotatePoint, TAU } from '../src/carousel/simulation.ts'
import { CarouselController } from '../src/carousel/controller.ts'
import { carouselDemoBoundaries, CAROUSEL_DEMO_DURATION } from '../src/carousel/demo.ts'
import { directCablePoints, DIRECT_CABLE_LENGTH, pathLength } from '../src/carousel/comparison.ts'
import { ROTOR_POWER, STATOR_POWER } from '../src/carousel/electrical.ts'
import { CatmullRomCurve3, Vector3 } from 'three'
const near=(a:number,b:number,e=1e-8)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`)
test('stopped carousel holds its angular position and rejects invalid time',()=>{
 const c=new CarouselController();c.tick(10);near(c.motion.angleRadians,0);near(c.motion.totalRadians,0)
 assert.equal(carouselReadout(c.motion).operating,'Stopped');assert.equal(c.connected,true)
 assert.throws(()=>c.tick(NaN));assert.throws(()=>advanceCarousel(c.motion,-1))
})
for(const rpm of [2,6,12])test(`${rpm} RPM: acceleration, angular travel, stop and live position share one state`,()=>{
 const c=new CarouselController();c.setRPM(rpm);c.start();c.tick(10)
 near(c.motion.rpm,rpm);near(c.motion.angleRadians,rpm*TAU/60*(10-rpm/(2*CAROUSEL.accelerationRPM)),1e-6)
 const r=carouselReadout(c.motion);assert.ok(r.degrees>=0&&r.degrees<360);near(r.totalRevolutions,c.motion.totalRadians/TAU)
 c.stop();c.tick(5);near(c.motion.rpm,0);const stopped=c.motion.angleRadians;c.tick(5);near(c.motion.angleRadians,stopped)
})
test('reverse ramps through rest; absolute revolutions continue increasing',()=>{
 const c=new CarouselController();c.start();c.tick(4);const total=c.motion.totalRadians;c.reverse();c.tick(2);near(c.motion.rpm,0);c.tick(4)
 near(c.motion.rpm,-6);assert.ok(c.motion.totalRadians>total);assert.equal(carouselReadout(c.motion).direction,'Reverse')
 c.setRPM(999);near(c.motion.targetRPM,12);c.setRPM(-1);near(c.motion.targetRPM,0)
})
test('bottles coincide with rotating stations throughout the carousel arc and use tangent feed lanes',()=>{
 for(let a=0;a<TAU;a+=.07)for(let i=0;i<CAROUSEL.stations;i++){
  const p=bottlePath(a,i)
  if(p.stage==='carousel'){
   const local:[number,number,number]=[CAROUSEL.pitchRadius*Math.cos(i*TAU/12),CAROUSEL.deckY,-CAROUSEL.pitchRadius*Math.sin(i*TAU/12)]
   rotatePoint(local,a).forEach((v,j)=>near(v,p.position[j]))
  }else if(p.visible){near(Math.abs(p.position[0]),CAROUSEL.pitchRadius);assert.ok(p.position[2]>0)}
 }
})
test('fill levels follow angular passage and stop changing without contacts or in reverse',()=>{
 const input={...initialCarouselMotion(),running:true,rpm:6,angleRadians:CAROUSEL.fillStart+.1,fillLevels:Array(12).fill(0)}
 const filled=advanceCarousel(input,1);near(filled.fillLevels[0],.3,1e-7)
 near(advanceCarousel(input,1,false).fillLevels[0],0)
 const reverse={...input,rpm:-6,direction:-1 as const};near(advanceCarousel(reverse,.1).fillLevels[0],0)
 const recirculated=advanceCarousel({...input,angleRadians:Math.PI+CAROUSEL.conveyorPhase-.01,fillLevels:Array(12).fill(1)},.1)
 near(recirculated.fillLevels[0],0)
})
test('input cable stays in world coordinates; rotor output shares machine transform and clears fixed beam',()=>{
 const fixed=JSON.stringify(STATOR_POWER)
 for(const angle of [0,.5,2,10]){
  const endpoint=rotatePoint(ROTOR_POWER.at(-1)!,angle);near(Math.hypot(endpoint[0],endpoint[2]),Math.hypot(...[ROTOR_POWER.at(-1)![0],ROTOR_POWER.at(-1)![2]]))
  assert.equal(JSON.stringify(STATOR_POWER),fixed)
 }
 // Output crosses the stationary support height inside the hollow shaft.
 const curve=new CatmullRomCurve3(ROTOR_POWER.map(p=>new Vector3(...p)))
 for(const p of curve.getPoints(1000))if(p.y>1.72&&p.y<1.9)assert.ok(Math.hypot(p.x,p.z)+.003<.008,'cable must clear the bore through the support height')
 assert.ok(ROTOR_POWER[8][1]<1.765)
})
test('exploded contacts disconnect immediately and restore only after smooth reassembly',()=>{
 const c=new CarouselController();c.start();c.tick(3);c.toggleExploded();assert.equal(c.connected,false);c.tick(.1)
 assert.ok(c.explosion>0&&c.explosion<1);c.tick(2);near(c.explosion,1)
 c.toggleExploded();assert.equal(c.connected,false);c.tick(.1);assert.ok(c.explosion>0);c.tick(2);near(c.explosion,0);assert.equal(c.connected,true);assert.ok(c.motion.rpm>0)
})
test('direct-cable comparison stops at both limits and preserves cable length and endpoints',()=>{
 const c=new CarouselController();c.compareWithout();const ref=c.directReference!;c.tick(15);near(c.motion.angleRadians-ref,Math.PI/2);near(c.motion.rpm,0);assert.equal(c.motion.running,false)
 c.reverse();c.start();c.tick(15);near(c.motion.angleRadians-ref,-Math.PI/2);near(c.motion.rpm,0)
 for(const reference of [0,.8,4])for(const twist of [-Math.PI/2,-.5,0,.5,Math.PI/2]){
  const p=directCablePoints(twist,reference);near(pathLength(p),DIRECT_CABLE_LENGTH,1e-7)
  const fixed=directCablePoints(0,reference)[0];p[0].forEach((n,j)=>near(n,fixed[j]))
  near(p.at(-1)![0],.075*Math.cos(reference+twist));near(p.at(-1)![2],-.075*Math.sin(reference+twist))
 }
 c.compareWith();c.tick(40);assert.ok(c.motion.angleRadians-ref>TAU*3);assert.equal(c.connected,true)
})
test('60-second guide pauses the whole mechanism, visits all modes and ends on continuous rotation',()=>{
 const c=new CarouselController();c.demoStart();c.tick(20);c.demoPause();const frozen=JSON.stringify(c.getSnapshot());c.tick(5);assert.equal(JSON.stringify(c.getSnapshot()),frozen);c.demoPause()
 c.tick(carouselDemoBoundaries[7]-20+.2);assert.equal(c.exploded,true);assert.equal(c.connected,false)
 c.tick(carouselDemoBoundaries[8]-c.demo.elapsed+.2);assert.equal(c.comparison,'without')
 c.tick(CAROUSEL_DEMO_DURATION-c.demo.elapsed);assert.equal(c.demo.active,false);assert.equal(c.comparison,'with');assert.equal(c.connected,true);assert.ok(c.motion.rpm>0)
 c.demoStart();near(c.demo.elapsed,0);near(c.motion.angleRadians,0);c.demoNext();assert.equal(c.motion.running,true);c.setRPM(3);assert.equal(c.demo.active,false)
 c.reset();assert.deepEqual(c.motion,initialCarouselMotion())
})
test('motion integration is consistent at 30 and 120 FPS',()=>{
 let a={...initialCarouselMotion(),running:true},b={...a}
 for(let i=0;i<300;i++)a=advanceCarousel(a,1/30)
 for(let i=0;i<1200;i++)b=advanceCarousel(b,1/120)
 near(a.angleRadians,b.angleRadians,1e-7);a.fillLevels.forEach((v,i)=>near(v,b.fillLevels[i],1e-7))
})
