import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceConveyor, initialConveyorMotion, TAU } from '../src/conveyor/simulation.ts'
import { feedbackReadout, FEEDBACK } from '../src/conveyor/feedback.ts'
import { CarouselController } from '../src/carousel/controller.ts'
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`)
test('three feedback locations share the drive state, with explicit wheel geometry and gearbox ratio',()=>{
 const motion=advanceConveyor({...initialConveyorMotion(),running:true},10),shaft=feedbackReadout(motion,'shaft'),motor=feedbackReadout(motion,'motor'),wheel=feedbackReadout(motion,'wheel')
 near(motor.rpm,shaft.rpm*FEEDBACK.gearboxRatio);near(motor.turns,shaft.turns*FEEDBACK.gearboxRatio);near(wheel.rpm*FEEDBACK.wheelCircumference/60,shaft.speed);near(wheel.travel,shaft.travel);near(wheel.turns,motion.beltTravel/.3)
})
test('measuring wheel detects surface travel loss that shaft and motor feedback cannot see',()=>{
 const base={...initialConveyorMotion(),rpm:60,running:true},grip=advanceConveyor(base,3),slip=advanceConveyor({...base,slip:true},3)
 near(feedbackReadout(slip,'shaft').rpm,feedbackReadout(grip,'shaft').rpm);near(feedbackReadout(slip,'motor').rpm,feedbackReadout(grip,'motor').rpm)
 near(feedbackReadout(slip,'wheel').speed,feedbackReadout(grip,'wheel').speed*.85);near(feedbackReadout(slip,'wheel').travel,feedbackReadout(grip,'wheel').travel*.85);near(feedbackReadout(slip,'wheel').slip,15)
})
test('raw differential channels are complementary across directions and encoder locations',()=>{
 for(const sensor of ['motor','shaft','wheel'] as const)for(let n=-100;n<=100;n++){
  const r=feedbackReadout({...initialConveyorMotion(),shaftRadians:n*.17,beltTravel:n*.17*.16,rpm:n},sensor)
  assert.equal(r.signals.a+r.signals.aNot,1);assert.equal(r.signals.b+r.signals.bNot,1);assert.ok(r.degrees>=0&&r.degrees<360);assert.ok(r.frequency>=0)
 }
 near(feedbackReadout({...initialConveyorMotion(),shaftRadians:TAU},'motor').turns,20)
})
test('opening rotating supply freezes horse actuators while separately supplied base keeps turning',()=>{
 const c=new CarouselController();c.start();c.tick(3);assert.ok(c.ridePhase>0)
 c.setSupplyConnected(false);const phase=c.ridePhase,angle=c.motion.angleRadians;c.tick(2)
 assert.equal(c.connected,false);near(c.ridePhase,phase);assert.ok(c.motion.angleRadians>angle);assert.equal(c.getSnapshot().supplyConnected,false)
 c.setSupplyConnected(true);c.tick(1);assert.equal(c.connected,true);assert.ok(c.ridePhase>phase)
 c.reset();assert.equal(c.supplyConnected,true);near(c.ridePhase,0)
})
test('contact separation and tour pause freeze actuator state, reassembly resumes it',()=>{
 const c=new CarouselController();c.start();c.tick(2);c.toggleExploded();const phase=c.ridePhase;c.tick(1);near(c.ridePhase,phase)
 c.toggleExploded();c.tick(3);assert.ok(c.ridePhase>phase)
 c.demoStart();c.tick(6);c.demoPause();const frozen=c.ridePhase;c.tick(10);near(c.ridePhase,frozen)
})
