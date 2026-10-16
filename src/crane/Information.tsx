import type { ReactNode } from 'react'
import { drawWireReadout } from './drawWire'
import { ArrowLeft, Crosshair, MoveUpRight } from 'lucide-react'
import type { CraneBinding } from './useCrane'
import { inclinometerReading } from './kinematics'
import { Button } from '../components/UI'
export function AngleGauge({angle}:{angle:number}){
 const radians=angle*Math.PI/180,origin=[40,177],radius=156
 return <svg className="angle-gauge" viewBox="0 -16 300 223" role="img" aria-label={`Boom elevation gauge: ${angle.toFixed(1)} degrees above horizontal`}>
  <path d="M196 177 A156 156 0 0 0 80.4 26.3" fill="none" stroke="#ffffff16" strokeWidth="13"/>
  <path d={`M196 177 A156 156 0 0 0 ${40+radius*Math.cos(radians)} ${177-radius*Math.sin(radians)}`} fill="none" stroke="#f5a05c" strokeWidth="3"/>
  {[0,15,30,45,60,75].map(value=>{const a=value*Math.PI/180;return <g key={value}><line x1={40+147*Math.cos(a)} y1={177-147*Math.sin(a)} x2={40+164*Math.cos(a)} y2={177-164*Math.sin(a)} stroke="#8da6b2"/><text x={40+184*Math.cos(a)} y={181-184*Math.sin(a)} fill="#bacbd2" fontSize="13" textAnchor="middle">{value}°</text></g>})}
  <line x1={origin[0]} y1={origin[1]} x2="270" y2="177" stroke="#9dbac6" strokeDasharray="4 5"/>
  <line x1="40" y1="177" x2={40+156*Math.cos(radians)} y2={177-156*Math.sin(radians)} stroke="#ffa55e" strokeWidth="7" strokeLinecap="round"/>
  <circle cx="40" cy="177" r="8" fill="#e6ede9"/><text x="180" y="204" fill="#8faab7" fontSize="11" textAnchor="middle">HORIZONTAL REFERENCE</text>
 </svg>
}
export function CraneInformation({binding,selected,onSelect,onReturn,navigation}:{binding:CraneBinding;selected:boolean;onSelect:()=>void;onReturn:()=>void;navigation?:ReactNode}){
 const {controller,snapshot}=binding,{motion}=snapshot,angle=inclinometerReading(motion)
 const moving=Math.abs(motion.angularVelocity)>.01
 return <aside className="product-panel crane-product conveyor-product">
  <div className="product-heading"><span className="panel-label">THE KÜBLER CONNECTION</span><MoveUpRight size={20}/></div>
  <h2>Boom angle feedback</h2><span className="concept-tag">Kübler Inclinometer <b>IN88</b></span>
  {navigation}<section className="crane-instrument" aria-label="Live inclinometer measurements"><div className="crane-measurement-title"><span className="live-dot"/> LIVE BOOM ELEVATION ANGLE</div>
   <div className="crane-angle"><strong data-testid="boom-angle">{angle.toFixed(1)}</strong><span>°</span></div>
   <AngleGauge angle={angle}/>
   <dl className="crane-readouts"><div><dt>Boom position</dt><dd data-testid="boom-position">{moving?'Moving':angle<.05?'Lowered':'Raised'}</dd></div><div><dt>Angular velocity</dt><dd><span data-testid="angular-velocity">{motion.angularVelocity.toFixed(1)}</span><small>°/s</small></dd></div><div><dt>Reference</dt><dd>Horizontal</dd></div></dl>
   <p className="reference-note">Level chassis · 0° sensor mounting offset.<br/>0–75° is the crane demonstration range.</p>
  </section>
  <div className="sensor-companion"><span>DRAW-WIRE / BOOM EXTENSION</span><strong data-testid="companion-extension">{drawWireReadout(motion).extension.toFixed(2)}<small>m</small></strong></div>
  <div className="sensor-actions"><Button className={selected?'selected-button':'sensor-button'} onClick={onSelect}><Crosshair size={18}/> Locate inclinometer</Button><Button className="return-button" onClick={onReturn}><ArrowLeft size={18}/> Machine view</Button><Button className={snapshot.principle?'selected-button':''} aria-pressed={snapshot.principle} onClick={()=>{controller.togglePrinciple();if(!selected)onSelect()}}>Show measurement principle</Button></div>
  {snapshot.principle&&<section className="principle-explanation"><h3>Orientation relative to gravity</h3><svg viewBox="0 0 280 120" role="img" aria-label="A sensor rotates with the boom; the gravity vector remains vertical"><path d="M22 65 H255" stroke="#c8d9df" strokeDasharray="4 5"/><g transform={`translate(95 65) rotate(${-angle})`}><rect x="-42" y="-14" width="135" height="28" rx="4" fill="#d5ac4d"/><rect x="-8" y="-12" width="26" height="24" fill="#e5e6de" stroke="#ee8c49" strokeWidth="3"/></g><path d="M95 38 V110 m-6 -9 6 9 6 -9" stroke="#9edce5" fill="none" strokeWidth="3"/><text x="111" y="109" fill="#a9d6de" fontSize="12">gravity</text></svg><p>The housing rotates with the boom; gravity stays vertical. An inclinometer senses the gravity components in its own axes and derives its tilt. The horizontal reference is perpendicular to gravity.</p><p>This is a simplified gravity-based illustration. Motion and vibration affect real measurements and require appropriate filtering and application design.</p></section>}
  {selected&&<section className="installation-note"><h3>Rigidly mounted to the base boom</h3><p>The metal housing is bolted to a steel mounting plate. Its sensing orientation follows the boom. The M12 cable carries the electrical signal; it does not measure the angle through a linkage.</p></section>}
  <details className="encoder-explainer"><summary>What does the inclinometer do?</summary><p>An inclinometer measures angular orientation relative to gravity. Here it reports boom elevation above horizontal, with the chassis assumed level.</p><h3>Why does it matter?</h3><p>Elevation is an input to crane geometry and load-moment management. Actual lifting safety also depends on load, extension, support conditions, additional measurements, controls and certified machine systems.</p></details>
  <p className="model-disclaimer">Illustrative crane and mounting geometry. IN88 housing envelope based on the published 60 × 80 × 23 mm dimensions; surface details are simplified. <a href="https://www.kuebler.com/en/products/measurement/inclinometers/product-details/IN88" target="_blank" rel="noreferrer">Official product reference ↗</a></p>
 </aside>
}
