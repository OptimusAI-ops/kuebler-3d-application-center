import { advanceConveyor, CONVEYOR, conveyorReadout, initialConveyorMotion } from './simulation.ts'
import type { ConveyorMotion } from './simulation.ts'
import { CONVEYOR_DEMO_DURATION, conveyorDemoSteps } from './demo.ts'
export interface SignalSample { time: number; phase: number }
export interface DemoState { active: boolean; paused: boolean; elapsed: number; step: number; generation: number }
export interface ConveyorSnapshot { motion: ConveyorMotion; demo: DemoState; cutaway: boolean; samples: readonly SignalSample[] }
/** Owns motion, signal history and the demo clock. React samples it; the scene never owns another clock. */
export class ConveyorController {
  motion = initialConveyorMotion()
  demo: DemoState = { active:false, paused:false, elapsed:0, step:0, generation:0 }
  cutaway = false
  private samples: SignalSample[] = [{time:0,phase:0}]
  private listeners = new Set<()=>void>()
  private publishTime = 0
  private snapshot!: ConveyorSnapshot
  constructor() { this.publish() }
  subscribe = (listener: ()=>void) => { this.listeners.add(listener); return () => {this.listeners.delete(listener)} }
  getSnapshot = () => this.snapshot
  private publish() {
    this.snapshot = { motion:{...this.motion}, demo:{...this.demo}, cutaway:this.cutaway, samples:[...this.samples] }
    this.listeners.forEach(listener=>listener())
  }
  private interrupt() { this.demo = {...this.demo,active:false,paused:false} }
  start = () => { this.interrupt(); this.motion={...this.motion,running:true}; this.publish() }
  stop = () => { this.interrupt(); this.motion={...this.motion,running:false}; this.publish() }
  setRPM = (rpm:number) => {
    if(!Number.isFinite(rpm)) return
    this.interrupt(); this.motion={...this.motion,targetRPM:Math.max(0,Math.min(CONVEYOR.maxRPM,rpm))}; this.publish()
  }
  reverse = () => { this.interrupt(); this.motion={...this.motion,direction:this.motion.direction===1?-1:1}; this.publish() }
  setSlip = (slip:boolean) => { this.interrupt(); this.motion={...this.motion,slip}; this.publish() }
  setCutaway = (cutaway:boolean) => { this.cutaway=cutaway; this.publish() }
  reset = () => { this.interrupt(); this.motion=initialConveyorMotion(); this.samples=[{time:0,phase:0}]; this.cutaway=false; this.publishTime=0; this.publish() }
  demoStart = () => {
    this.motion={...initialConveyorMotion(),targetRPM:30}; this.samples=[{time:0,phase:0}]; this.cutaway=false
    this.demo={active:true,paused:false,elapsed:0,step:0,generation:this.demo.generation+1}; this.publishTime=0; this.publish()
  }
  demoExit = () => { this.interrupt(); this.motion={...this.motion,running:false}; this.publish() }
  demoPause = () => { this.demo={...this.demo,paused:!this.demo.paused}; this.publish() }
  private enterStep(step:number) {
    this.demo={...this.demo,step}
    if(step===1) this.motion={...this.motion,running:true,targetRPM:30}
    if(step===2) this.motion={...this.motion,targetRPM:90}
    if(step===6) this.motion={...this.motion,direction:-1}
    if(step===8) this.motion={...this.motion,running:false}
  }
  demoNext = () => {
    if(!this.demo.active) return
    if(this.demo.step===conveyorDemoSteps.length-1) {this.demoExit();return}
    const step=this.demo.step+1
    this.demo={...this.demo,elapsed:step*6}; this.enterStep(step); this.publish()
  }
  /** The caller supplies elapsed seconds. A hidden browser must not silently fast-forward machinery. */
  tick(seconds:number) {
    if(!Number.isFinite(seconds)||seconds<0) throw new RangeError('Invalid frame duration')
    if(this.demo.active&&this.demo.paused) return
    if(!this.demo.active&&!this.motion.running&&this.motion.rpm===0) return
    const previousRPM=this.motion.rpm
    let remaining=seconds
    while(remaining>1e-10) {
      const untilBoundary=this.demo.active ? (this.demo.step+1)*6-this.demo.elapsed : Infinity
      const dt=Math.min(remaining,1/120,Math.max(1e-10,untilBoundary))
      this.motion=advanceConveyor(this.motion,dt)
      this.samples.push({time:this.motion.elapsed,phase:this.motion.shaftRadians/(Math.PI*2)*CONVEYOR.ppr/CONVEYOR.signalDivider})
      if(this.samples.length>241) this.samples.shift()
      if(this.demo.active) {
        this.demo={...this.demo,elapsed:this.demo.elapsed+dt}
        if(this.demo.elapsed>=CONVEYOR_DEMO_DURATION-1e-8) {this.interrupt();this.motion={...this.motion,running:false};this.publish()}
        else if(this.demo.elapsed>=(this.demo.step+1)*6-1e-8) {this.enterStep(this.demo.step+1);this.publish()}
      }
      remaining-=dt
    }
    this.publishTime+=seconds
    if(this.publishTime>=1/20 || (previousRPM!==0&&this.motion.rpm===0)) {this.publishTime=0;this.publish()}
  }
  readout = () => conveyorReadout(this.motion)
}
