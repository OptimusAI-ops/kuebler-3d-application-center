import { Activity } from 'lucide-react'
import { CONVEYOR, conveyorReadout, quadrature } from './simulation'
import type { ConveyorSnapshot } from './controller'
const format=(n:number)=>n.toLocaleString('en-US')
function SignalPlot({snapshot}:{snapshot:ConveyorSnapshot}) {
 const {samples,motion,demo}=snapshot,data=conveyorReadout(motion)
 const end=samples[samples.length-1]?.time||0,start=end-2
 const channelPath=(channel:'a'|'b',high:number)=>{
  let path='',previous=0
  samples.forEach((sample,i)=>{const x=Math.max(0,(sample.time-start)/2*296+2),level=high+(quadrature(sample.phase)[channel]?0:19);if(i===0)path=`M2 ${level}H${x}`;else path+=`H${x}V${level}`;previous=level})
  return path+`H298V${previous}`
 }
 return <section className="pulse-scope" aria-label="Live encoder signal visualization"><div className="scope-title"><span>A / B SIGNALS</span><b>{data.frequency.toFixed(0)} Hz <small>per channel</small></b></div><svg viewBox="0 0 300 112" role="img" aria-label={`Time-expanded encoder signals. ${data.direction}. Actual frequency ${data.frequency.toFixed(1)} hertz per channel.`}><path d="M2 41H298M2 85H298" stroke="#ffffff12"/><path d={channelPath('a',19)} stroke="#f19a58" strokeWidth="1.5" fill="none"/><path d={channelPath('b',63)} stroke="#81b4bf" strokeWidth="1.5" fill="none"/><text x="3" y="12" fill="#ed9a60" fontSize="10">CHANNEL A</text><text x="3" y="56" fill="#81b4bf" fontSize="10">CHANNEL B</text><text x="3" y="107" fill="#9cafb8" fontSize="9">2 s window</text><text x="298" y="107" textAnchor="end" fill="#c2cdd0" fontSize="9">{demo.paused?'PAUSED':data.direction==='Stopped'?'STOPPED':data.direction==='Forward'?'A LEADS B':'B LEADS A'}</text></svg><p className="scope-note">Frequency reduced {CONVEYOR.signalDivider}× for visibility. This illustration follows the shaft angle; actual output frequency is shown above.</p></section>
}
export function ConveyorReadouts({snapshot}:{snapshot:ConveyorSnapshot}) {
 const {motion,demo}=snapshot,data=conveyorReadout(motion)
 return <section className="conveyor-readouts" aria-label="Live encoder data">
  <div className="panel-label"><Activity size={16}/> LIVE MEASUREMENTS <span className={Math.abs(motion.rpm)>.001?'live-dot':''}/></div>
  <div className="primary-readouts"><div><span>Shaft speed</span><strong data-testid="shaft-rpm">{Math.abs(motion.rpm).toFixed(1)}<small>RPM</small></strong></div><div><span title="Calculated from drive shaft rotation">{motion.slip?'Shaft-derived speed':'Belt speed'}</span><strong data-testid="belt-speed">{Math.abs(data.shaftSpeed).toFixed(3)}<small>m/s</small></strong></div></div>
  <div className="direction-line"><span data-testid="motion-direction">{demo.paused?'Demo paused':data.direction}</span><span>{demo.paused?'Time frozen':motion.running&&motion.direction*motion.rpm<0?'Braking to reverse':motion.running&&motion.targetRPM>Math.abs(motion.rpm)+.01?'Accelerating':!motion.running&&Math.abs(motion.rpm)>.01?'Decelerating':'Drive direction'}</span></div>
  <dl className="measurement-list"><div><dt>Angular position<small>Within one revolution</small></dt><dd data-testid="shaft-angle">{(Math.round(data.degrees*100)/100%360).toFixed(2)}<small>°</small></dd></div><div><dt>Pulse count<small>Net pulses since reset</small></dt><dd data-testid="pulse-count">{format(data.pulseCount)}</dd></div><div><dt>Travel distance<small>Shaft-derived, net</small></dt><dd data-testid="travel-distance">{data.inferredTravel.toFixed(3)}<small>m</small></dd></div><div><dt>Total rotation<small>Since reset</small></dt><dd data-testid="accumulated-turns">{data.turns.toFixed(3)}<small>rev</small></dd></div></dl>
  <div className="resolution-strip"><span>Example resolution</span><strong>1024 <small>PPR</small></strong></div>
  <p className="reference-note">Position is relative to reset. An incremental encoder does not retain absolute position after power loss.</p>
  {motion.slip&&<section className="slip-readout"><h3>15% belt slip enabled</h3><dl><div><dt>Shaft-derived speed</dt><dd>{Math.abs(data.shaftSpeed).toFixed(3)} m/s</dd></div><div><dt>Actual belt speed</dt><dd data-testid="actual-belt-speed">{Math.abs(data.actualSpeed).toFixed(3)} m/s</dd></div><div><dt>Actual displacement</dt><dd>{motion.beltTravel.toFixed(3)} m</dd></div></dl><p>Slip is imposed by this simulation. The shaft encoder cannot detect it alone; a measuring wheel can measure surface travel directly.</p></section>}
  <details className="signal-disclosure" open={demo.active&&(demo.step===5||demo.step===7)?true:undefined}><summary>Encoder signals<span>{data.frequency.toFixed(0)} Hz / channel</span></summary><SignalPlot snapshot={snapshot}/></details>
 </section>
}
