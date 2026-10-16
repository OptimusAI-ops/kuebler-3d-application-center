import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceConveyor, CONVEYOR, conveyorReadout, initialConveyorMotion, quadrature, TAU } from '../src/conveyor/simulation.ts'
import { ConveyorController } from '../src/conveyor/controller.ts'
const near=(actual:number,expected:number,tolerance=1e-8)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} ≠ ${expected}`)
for(const rpm of [0,30,60,120]) test(`${rpm} RPM: rotation, 1024 PPR, ×4 decoding, and surface speed remain consistent`,()=>{
 const motion=advanceConveyor({...initialConveyorMotion(),rpm,targetRPM:rpm,running:true},1)
 const output=conveyorReadout(motion)
 near(output.turns,rpm/60);near(output.frequency,rpm/60*1024)
 near(output.shaftSpeed,TAU*.16*rpm/60)
 near(output.actualSpeed,output.shaftSpeed)
 near(motion.beltTravel,output.shaftSpeed)
 assert.equal(output.pulseCount,rpm/60*1024)
 assert.equal(output.quadratureCount,rpm/60*4096)
 near(output.degrees,rpm===30?180:0)
})
test('start and stop integrate the acceleration ramp instead of jumping to commanded RPM',()=>{
 let state={...initialConveyorMotion(),running:true,targetRPM:60}
 state=advanceConveyor(state,1);near(state.rpm,30);near(state.shaftRadians,Math.PI/2)
 state=advanceConveyor(state,1);near(state.rpm,60);near(state.shaftRadians,TAU)
 state=advanceConveyor({...state,running:false},2);near(state.rpm,0);near(state.shaftRadians,TAU*2)
 const stopped=advanceConveyor(state,20);near(stopped.shaftRadians,state.shaftRadians)
})
test('reversal crosses zero before increasing reverse speed and unwinds the incremental count',()=>{
 let state={...initialConveyorMotion(),rpm:60,running:true,direction:-1 as const}
 state=advanceConveyor(state,1);near(state.rpm,30);near(state.shaftRadians,.75*TAU)
 state=advanceConveyor(state,1);near(state.rpm,0);near(state.shaftRadians,TAU)
 const countAtZero=conveyorReadout(state).quadratureCount
 state=advanceConveyor(state,1);near(state.rpm,-30);near(state.shaftRadians,.75*TAU)
 assert.ok(conveyorReadout(state).quadratureCount<countAtZero)
 state=advanceConveyor(state,1);near(state.rpm,-60);near(state.shaftRadians,0)
})
test('piecewise integration is independent of frame size, including reversal boundaries',()=>{
 const input={...initialConveyorMotion(),rpm:80,running:true,targetRPM:100,direction:-1 as const}
 const coarse=advanceConveyor(input,10)
 let fine=input;for(let i=0;i<1000;i++)fine=advanceConveyor(fine,.01)
 near(coarse.rpm,fine.rpm);near(coarse.shaftRadians,fine.shaftRadians);near(coarse.totalBeltTravel,fine.totalBeltTravel)
})
test('controlled slip changes belt/idler/package travel without changing encoder rotation',()=>{
 const input={...initialConveyorMotion(),rpm:60,targetRPM:60,running:true}
 const normal=advanceConveyor(input,3),slip=advanceConveyor({...input,slip:true},3)
 near(slip.shaftRadians,normal.shaftRadians);near(slip.beltTravel,normal.beltTravel*.85)
 assert.equal(conveyorReadout(slip).pulseCount,conveyorReadout(normal).pulseCount)
 near(conveyorReadout(slip).actualSpeed,conveyorReadout(normal).shaftSpeed*.85)
})
test('quadrature follows a Gray-code cycle, with lead/lag reversed when traversed backward',()=>{
 const forward=[0,.25,.5,.75,1].map(phase=>quadrature(phase))
 assert.deepEqual(forward,[{a:1,b:0},{a:1,b:1},{a:0,b:1},{a:0,b:0},{a:1,b:0}])
 const reverse=[0,-.25,-.5,-.75,-1].map(phase=>quadrature(phase))
 assert.deepEqual(reverse,[{a:1,b:0},{a:0,b:0},{a:0,b:1},{a:1,b:1},{a:1,b:0}])
 const frozen=initialConveyorMotion();assert.deepEqual(conveyorReadout(advanceConveyor(frozen,2)).signals,conveyorReadout(frozen).signals)
})
test('54-second guided demonstration pauses both clocks, restarts, reverses, and finishes stopped',()=>{
 const controller=new ConveyorController();controller.demoStart();controller.tick(20)
 assert.equal(controller.demo.step,3);near(controller.motion.rpm,90)
 controller.demoPause();const before={...controller.motion},elapsed=controller.demo.elapsed
 controller.tick(10);assert.deepEqual(controller.motion,before);near(controller.demo.elapsed,elapsed)
 controller.demoPause();controller.tick(23);assert.equal(controller.demo.step,7);near(controller.motion.rpm,-90)
 controller.tick(11);assert.equal(controller.demo.active,false);near(controller.motion.rpm,0);near(conveyorReadout(controller.motion).turns,26.5);assert.equal(conveyorReadout(controller.motion).pulseCount,27136)
 controller.demoStart();assert.equal(controller.demo.step,0);near(controller.motion.shaftRadians,0);near(controller.demo.elapsed,0)
 controller.tick(15);controller.demoExit();controller.tick(4);assert.equal(controller.demo.active,false);near(controller.motion.rpm,0)
})
test('manual commands interrupt the demo, respect the range, and reset reference and display history',()=>{
 const controller=new ConveyorController();controller.demoStart();controller.tick(15);controller.setRPM(150)
 assert.equal(controller.demo.active,false);assert.equal(controller.motion.targetRPM,CONVEYOR.maxRPM)
 controller.setRPM(-1);assert.equal(controller.motion.targetRPM,0)
 controller.setRPM(NaN);assert.equal(controller.motion.targetRPM,0)
 controller.setSlip(true);controller.setCutaway(true);controller.reset()
 assert.deepEqual(controller.motion,initialConveyorMotion());assert.equal(controller.cutaway,false)
 assert.deepEqual(controller.getSnapshot().samples,[{time:0,phase:0}])
 assert.throws(()=>controller.tick(-1),RangeError)
})
test('display phases are derived from accumulated shaft angle with a declared 256× frequency expansion',()=>{
 const controller=new ConveyorController();controller.setRPM(120);controller.start();controller.tick(5)
 const history=controller.getSnapshot().samples,last=history[history.length-1]
 near(last.phase,controller.motion.shaftRadians/TAU*CONVEYOR.ppr/CONVEYOR.signalDivider)
 assert.ok(history.length<=241)
 controller.stop();controller.tick(4);const position=controller.motion.shaftRadians,heldHistory=controller.getSnapshot().samples
 controller.tick(2);near(controller.motion.shaftRadians,position);assert.deepEqual(controller.getSnapshot().samples,heldHistory)
})

test('reverse travel below the reference gives negative counts and a wrapped positive angle',()=>{
 const state=advanceConveyor({...initialConveyorMotion(),running:true,rpm:-30,targetRPM:30,direction:-1},1)
 const data=conveyorReadout(state)
 near(data.turns,-.5);near(data.degrees,180);assert.equal(data.pulseCount,-512);assert.equal(data.quadratureCount,-2048)
 near(data.inferredTravel,-Math.PI*.16);assert.equal(data.direction,'Reverse')
})
