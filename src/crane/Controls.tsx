import { useEffect } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { ArrowUp, ArrowDown, ArrowRight, ArrowLeft, RotateCcw, Repeat2, Square } from 'lucide-react'
import type { CraneBinding } from './useCrane'
export function CraneControls({controller,snapshot}:CraneBinding){
 useEffect(()=>{const release=()=>{controller.release();controller.releaseExtension()};window.addEventListener('blur',release);document.addEventListener('visibilitychange',release);return()=>{window.removeEventListener('blur',release);document.removeEventListener('visibilitychange',release);release()}},[controller])
 const holdProps=(direction:-1|1,axis:'angle'|'extension')=>{
  const hold=()=>axis==='angle'?controller.hold(direction):controller.holdExtension(direction),release=axis==='angle'?controller.release:controller.releaseExtension
  return {onPointerDown:(event:PointerEvent<HTMLButtonElement>)=>{if(event.button!==0)return;event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);hold()},onPointerUp:release,onPointerCancel:release,onLostPointerCapture:release,onBlur:release,onKeyDown:(event:KeyboardEvent)=>{if((event.key===' '||event.key==='Enter')&&!event.repeat){event.preventDefault();hold()}},onKeyUp:(event:KeyboardEvent)=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();release()}}}
 }
 return <div className="conveyor-control-deck crane-control-deck">
  <section className="crane-axis-controls" aria-label="Telescopic extension controls"><div className="crane-control-title">TELESCOPIC EXTENSION <span>0–8 m demonstration travel</span></div><div className="run-controls">
   <button {...holdProps(1,'extension')} className={snapshot.extensionCommand===1?'active':''} aria-label="Extend boom (hold)"><ArrowRight size={16}/> EXTEND BOOM <small>HOLD</small></button>
   <button {...holdProps(-1,'extension')} className={snapshot.extensionCommand===-1?'active':''} aria-label="Retract boom (hold)"><ArrowLeft size={16}/> RETRACT BOOM <small>HOLD</small></button>
   <button onClick={controller.resetExtension}><RotateCcw size={15}/> RESET EXTENSION</button>
   <button onClick={controller.toggleExtensionCycle} aria-pressed={snapshot.autoExtension} className={snapshot.autoExtension?'active':''}>{snapshot.autoExtension?<Square size={14}/>:<Repeat2 size={16}/>} {snapshot.autoExtension?'STOP EXTENSION CYCLE':'AUTO EXTEND / RETRACT'}</button>
  </div><div className="speed-row"><label><span>BOOM EXTENSION <output>{snapshot.motion.boomExtensionMeters.toFixed(2)} m</output></span><input aria-label="Boom extension" type="range" min="0" max="8" step=".01" value={snapshot.motion.boomExtensionMeters} onChange={event=>controller.setExtension(Number(event.target.value))}/></label><label className="crane-angle-set"><span>SET / m</span><input aria-label="Set boom extension (meters)" type="number" min="0" max="8" step=".01" value={Number(snapshot.motion.boomExtensionMeters.toFixed(2))} onChange={event=>{if(event.target.value!=='')controller.setExtension(Number(event.target.value))}}/></label><p className="crane-operation-note">Hold to telescope smoothly.<br/>The slider sets extension directly.</p></div></section>
  <section className="crane-axis-controls" aria-label="Boom elevation controls"><div className="crane-control-title">BOOM ELEVATION <span>Independent from telescopic extension</span></div><div className="run-controls">
   <button {...holdProps(1,'angle')} className={snapshot.command===1?'active':''} aria-label="Raise boom (hold)"><ArrowUp size={16}/> RAISE BOOM <small>HOLD</small></button>
   <button {...holdProps(-1,'angle')} className={snapshot.command===-1?'active':''} aria-label="Lower boom (hold)"><ArrowDown size={16}/> LOWER BOOM <small>HOLD</small></button>
   <button onClick={controller.reset}><RotateCcw size={15}/> RESET POSITION</button>
   <button onClick={controller.toggleCycle} aria-pressed={snapshot.autoCycle} className={snapshot.autoCycle?'active':''}>{snapshot.autoCycle?<Square size={14}/>:<Repeat2 size={16}/>} {snapshot.autoCycle?'STOP ANGLE CYCLE':'AUTO ANGLE CYCLE'}</button>
  </div><div className="speed-row"><label><span>BOOM ANGLE <output>{snapshot.motion.boomAngleDegrees.toFixed(1)}°</output></span><input aria-label="Boom angle" type="range" min="0" max="75" step=".1" value={snapshot.motion.boomAngleDegrees} onChange={event=>controller.setAngle(Number(event.target.value))}/></label><label className="crane-angle-set"><span>SET / °</span><input aria-label="Set boom angle (degrees)" type="number" min="0" max="75" step=".1" value={Number(snapshot.motion.boomAngleDegrees.toFixed(1))} onChange={event=>{if(event.target.value!=='')controller.setAngle(Number(event.target.value))}}/></label><button className="crane-stop" onClick={controller.stop}><Square size={16}/> STOP ALL MOTION</button></div></section>
 </div>
}
