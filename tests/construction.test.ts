import test from 'node:test'
import assert from 'node:assert/strict'
import { CatmullRomCurve3, Vector3 } from 'three'
import { conveyorSensors, FEEDBACK } from '../src/conveyor/feedback.ts'
import { beltPoint } from '../src/conveyor/geometry.ts'
import { CarouselController } from '../src/carousel/controller.ts'
import { SLIP_RING_OFFSET_Y, STATOR_POWER, STATOR_SIGNAL, ROTOR_POWER, ROTOR_SIGNAL } from '../src/carousel/electrical.ts'
test('MWE61 rolling circumference touches the belt and its contact bands clear the parcel lane',()=>{
 const wheel=conveyorSensors.wheel.location,r=FEEDBACK.wheelCircumference/(2*Math.PI)
 assert.ok(Math.abs(wheel[1]-r-beltPoint(1)[1])<1e-9)
 assert.ok(wheel[2]-.012>.215,'wheel must clear the 430 mm parcel lane')
 assert.ok(wheel[2]+.012<.425,'both contact bands must stay on the belt')
})
test('a non-destructive slip-ring cutaway preserves electrical contact and motion state',()=>{
 const c=new CarouselController();c.start();c.tick(3);const before=JSON.stringify(c.motion),phase=c.ridePhase
 c.setCutaway(true);assert.equal(c.getSnapshot().cutaway,true);assert.equal(c.connected,true);assert.equal(JSON.stringify(c.motion),before);assert.equal(c.ridePhase,phase)
 c.tick(1);assert.ok(c.ridePhase>phase)
 c.setSupplyConnected(false);c.setCutaway(false);assert.equal(c.connected,false,'changing the view must not reconnect an open circuit')
 c.reset();assert.equal(c.getSnapshot().cutaway,false)
})
test('the installed slip ring and all cable curves clear the ground inside the pedestal',()=>{
 assert.ok(1.738+SLIP_RING_OFFSET_Y>0)
 assert.ok(1.946+SLIP_RING_OFFSET_Y<.47,'interface must fit below the deck surface')
 for(const points of [STATOR_POWER,STATOR_SIGNAL,ROTOR_POWER,ROTOR_SIGNAL]){
  const curve=new CatmullRomCurve3(points.map(p=>new Vector3(...p)))
  for(const p of curve.getPoints(1000))assert.ok(p.y+SLIP_RING_OFFSET_Y>=.005,`cable crosses the ground at ${p.y+SLIP_RING_OFFSET_Y}`)
 }
})
