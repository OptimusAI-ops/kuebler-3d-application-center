import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceCrane, boomPointToWorld, boomTipLocal, CRANE, cylinderGeometry, inclinometerReading, initialCraneMotion, innerSectionX, middleSectionX, sensorWorldPosition } from '../src/crane/kinematics.ts'
import { CraneController } from '../src/crane/controller.ts'
import { CRANE_DEMO_DURATION } from '../src/crane/demo.ts'
const near=(a:number,b:number,tolerance=1e-8)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`)
for(const angle of [0,15,30,45,60,75])test(`crane ${angle}°: actual orientation, sensor, pins, cab clearance`,()=>{
 const state={...initialCraneMotion(),boomAngleDegrees:angle}
 const pivot=boomPointToWorld([0,0,0],state),axis=boomPointToWorld([1,0,0],state)
 pivot.forEach((n,i)=>near(n,CRANE.pivot[i]));near(Math.atan2(axis[1]-pivot[1],axis[0]-pivot[0])*180/Math.PI,angle)
 near(inclinometerReading(state),angle)
 const sensor=sensorWorldPosition(state)
 near(Math.hypot(sensor[0]-pivot[0],sensor[1]-pivot[1]),Math.hypot(CRANE.sensorMount[0],CRANE.sensorMount[1]))
 for(const z of [-.24,.24]){
  const hydraulic=cylinderGeometry(state,z),upper=boomPointToWorld([2.5,-.35,z],state)
  assert.deepEqual(hydraulic.upper,upper);assert.deepEqual(hydraulic.lower,[-.5,1.25,z])
  assert.ok(hydraulic.length>CRANE.cylinderBarrelLength+.1)
  assert.ok(hydraulic.length-CRANE.cylinderBarrelLength<CRANE.cylinderBarrelLength)
 }
 // Every lower point of boom geometry over the driving cab clears its 2.41 m beacon height.
 for(let x=0;x<=7.6;x+=.025){const bottom=boomPointToWorld([x,-.33,0],state);if(bottom[0]>=2.18&&bottom[0]<=4.06)assert.ok(bottom[1]>2.41)}
 const tip=boomPointToWorld(boomTipLocal(state),state);assert.ok(tip[1]-1.15-.52>0)
})
test('nested extension has overlap throughout travel and stays independent of elevation',()=>{
 for(const extension of [0,2.4,4]){
  assert.ok(middleSectionX(extension)<CRANE.baseLength)
  assert.ok(innerSectionX(extension)<middleSectionX(extension)+CRANE.middleLength)
  const c=new CraneController();c.setExtension(extension);c.hold(1);c.tick(3);near(c.motion.boomExtensionMeters,extension)
 }
})
test('raise, release and lower accelerate smoothly, stop, and obey end limits',()=>{
 const c=new CraneController();c.setAngle(30);c.hold(1);c.tick(.1);assert.ok(c.motion.angularVelocity>0&&c.motion.angularVelocity<6);c.tick(2);assert.ok(c.motion.boomAngleDegrees>40)
 c.release();c.tick(2);near(c.motion.angularVelocity,0);const stopped=c.motion.boomAngleDegrees;c.tick(2);near(c.motion.boomAngleDegrees,stopped)
 c.hold(-1);c.tick(20);near(c.motion.boomAngleDegrees,0);c.release();c.hold(1);c.tick(20);near(c.motion.boomAngleDegrees,75)
 c.setAngle(45);near(c.motion.boomAngleDegrees,45);near(c.motion.angularVelocity,0)
 c.reset();assert.deepEqual(c.motion,initialCraneMotion())
})
test('guide shares simulation clock, pauses everything, reaches 50 and returns to 10',()=>{
 const c=new CraneController();c.demoStart();near(c.motion.boomAngleDegrees,10);c.tick(18);near(c.motion.boomAngleDegrees,50)
 const before=JSON.stringify(c.motion);c.demoPause();c.tick(10);assert.equal(JSON.stringify(c.motion),before);near(c.demo.elapsed,18)
 c.demoPause();c.tick(CRANE_DEMO_DURATION-18);near(c.motion.boomAngleDegrees,10);assert.equal(c.demo.active,false)
})
test('cycle is bounded and can be stopped; manual controls interrupt walkthrough',()=>{
 const c=new CraneController();c.toggleCycle();c.tick(10);assert.ok(c.motion.boomAngleDegrees<=65);assert.ok(c.motion.angularVelocity<0);c.tick(10)
 c.stop();c.tick(1);near(c.motion.angularVelocity,0);assert.equal(c.autoCycle,false)
 c.demoStart();c.setAngle(15);assert.equal(c.demo.active,false)
 c.demoStart();c.hold(1);assert.equal(c.demo.active,false)
})
test('integration remains consistent across frame rates and rejects invalid time',()=>{
 let a=initialCraneMotion(),b=initialCraneMotion();for(let i=0;i<240;i++)a=advanceCrane(a,1/120,60);for(let i=0;i<120;i++)b=advanceCrane(b,1/60,60)
 near(a.boomAngleDegrees,b.boomAngleDegrees,1e-4);near(a.angularVelocity,b.angularVelocity,1e-4)
 assert.throws(()=>advanceCrane(a,-1,60));assert.throws(()=>new CraneController().tick(NaN))
})
