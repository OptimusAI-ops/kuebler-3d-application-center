import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceExtension, boomPointToWorld, CRANE, initialCraneMotion, innerSectionX, middleSectionX } from '../src/crane/kinematics.ts'
import { cableAnchorLocal, cableExitLocal, DRAW_WIRE, drawWireReadout } from '../src/crane/drawWire.ts'
import { CraneController } from '../src/crane/controller.ts'
import { EXTENSION_DEMO_DURATION } from '../src/crane/extensionDemo.ts'
const near=(a:number,b:number,tolerance=1e-8)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`)
for(const extension of [0,2,4,6,8])test(`${extension} m: endpoint geometry, independent elevation, drum and nesting`,()=>{
 for(const angle of [0,15,30,45,60,75])for(const slew of [0,55]){
  const state={...initialCraneMotion(),boomExtensionMeters:extension,boomAngleDegrees:angle,slewDegrees:slew},r=drawWireReadout(state)
  const exit=boomPointToWorld(cableExitLocal(),state),anchor=boomPointToWorld(cableAnchorLocal(state),state)
  assert.deepEqual(r.exit,exit);assert.deepEqual(r.anchor,anchor)
  near(r.cablePayout,Math.hypot(...anchor.map((n,i)=>n-exit[i])));near(r.referencePayout,.875)
  near(r.extension,extension);near(r.cablePayout,.875+extension);near(r.percentage,extension/8*100)
  near(r.drumRadians,-r.cablePayout/DRAW_WIRE.drumRadius);near(r.remainingCable+r.cablePayout,10)
  assert.ok(r.cablePayout<DRAW_WIRE.capacity)
  assert.ok(CRANE.baseLength-middleSectionX(extension)>=1.65-1e-8)
  assert.ok(middleSectionX(extension)+CRANE.middleLength-innerSectionX(extension)>=1.25-1e-8)
  // The fixed sensor clears the base collar; the moving bracket remains beyond the nested walls.
  assert.ok(cableAnchorLocal(state)[0]-.06>CRANE.baseLength)
  near(cableExitLocal()[1],cableAnchorLocal(state)[1]);near(cableExitLocal()[2],cableAnchorLocal(state)[2])
  assert.ok(cableExitLocal()[2]>.37)
 }
})
test('extension ramp decelerates at limits and reset smoothly retracts without changing elevation',()=>{
 const c=new CraneController();c.setAngle(42);c.setExtension(0);c.holdExtension(1);c.tick(.1)
 assert.ok(c.motion.extensionVelocity>0&&c.motion.extensionVelocity<.65)
 c.tick(20);near(c.motion.boomExtensionMeters,8);near(c.motion.extensionVelocity,0);near(c.motion.boomAngleDegrees,42)
 c.releaseExtension();c.resetExtension();c.tick(1);assert.ok(c.motion.boomExtensionMeters<8&&c.motion.boomExtensionMeters>7);near(c.motion.boomAngleDegrees,42)
 c.tick(20);near(c.motion.boomExtensionMeters,0);near(c.motion.extensionVelocity,0)
 c.setExtension(99);near(c.motion.boomExtensionMeters,8);c.setExtension(-1);near(c.motion.boomExtensionMeters,0)
})
test('holding either axis preserves the other command and sensor principle',()=>{
 const c=new CraneController();c.setExtension(2);c.setAngle(20);c.holdExtension(1);c.hold(1);c.tick(3)
 assert.ok(c.motion.boomAngleDegrees>30);assert.ok(drawWireReadout(c.motion).extension>3)
 const e=c.motion.boomExtensionMeters;c.releaseExtension();c.tick(2);assert.ok(c.motion.boomExtensionMeters>=e);near(c.motion.extensionVelocity,0);assert.ok(c.motion.angularVelocity>0)
 c.release();c.tick(1);const fixed=c.motion.boomExtensionMeters;c.hold(1);c.tick(2);near(drawWireReadout(c.motion).extension,fixed)
 c.release();c.tick(1);const angle=c.motion.boomAngleDegrees;c.holdExtension(-1);c.tick(2);near(c.motion.boomAngleDegrees,angle);assert.equal(drawWireReadout(c.motion).movement,'Retracting')
})
test('both automatic cycles operate simultaneously and stop independently',()=>{
 const c=new CraneController();c.setExtension(2);c.toggleCycle();c.toggleExtensionCycle();c.tick(3)
 assert.ok(c.motion.angularVelocity>0);assert.ok(c.motion.extensionVelocity>0)
 c.toggleCycle();c.tick(1);near(c.motion.angularVelocity,0);assert.ok(c.motion.extensionVelocity>0)
 c.stop();c.tick(2);near(c.motion.angularVelocity,0);near(c.motion.extensionVelocity,0)
 c.setExtension(8);c.toggleExtensionCycle();c.tick(2);assert.ok(c.motion.extensionVelocity<0)
})
test('65-second guide uses geometry-derived payout, cutaway, pause, reverse and combined mode',()=>{
 const c=new CraneController();c.demoStart('extension');near(c.motion.boomExtensionMeters,0)
 c.tick(15);near(drawWireReadout(c.motion).extension,3)
 c.tick(12);assert.equal(c.internalMechanism,true);c.demoPause();const state=JSON.stringify(c.motion);c.tick(10);assert.equal(JSON.stringify(c.motion),state);near(c.demo.elapsed,27)
 c.demoPause();c.tick(12);near(drawWireReadout(c.motion).extension,6)
 c.tick(15);near(drawWireReadout(c.motion).extension,0)
 c.tick(EXTENSION_DEMO_DURATION-54);assert.equal(c.demo.active,false);assert.equal(c.allSensors,true);near(c.motion.boomAngleDegrees,45);near(drawWireReadout(c.motion).extension,2)
 c.demoStart('extension');c.demoNext();near(c.demo.elapsed,4);c.setExtension(4);assert.equal(c.demo.active,false)
})
test('linear integration converges across frame rates and physical travel stays bounded',()=>{
 let a={...initialCraneMotion(),boomExtensionMeters:0},b={...a}
 for(let i=0;i<240;i++)a=advanceExtension(a,1/120,8)
 for(let i=0;i<120;i++)b=advanceExtension(b,1/60,8)
 near(a.boomExtensionMeters,b.boomExtensionMeters,1e-4);near(a.extensionVelocity,b.extensionVelocity,1e-4)
 let previous=8
 const c=new CraneController();c.setExtension(8);c.holdExtension(-1)
 for(let i=0;i<2000;i++){c.tick(.01);assert.ok(c.motion.boomExtensionMeters<=previous+1e-10&&c.motion.boomExtensionMeters>=0);previous=c.motion.boomExtensionMeters}
 near(previous,0);assert.throws(()=>advanceExtension(a,-1,8))
})
