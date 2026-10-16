import { Pause, Play, RotateCcw, X, ArrowRight } from 'lucide-react'
import type { DemoStep } from '../state/demoTypes'
export interface GuidedDemoHandle { active:boolean;paused:boolean;step:number;generation:number;steps:readonly DemoStep[];elapsed?:number;start:()=>void;exit:()=>void;togglePause:()=>void;next:()=>void }
export function GuidedDemo({ demo }: { demo: GuidedDemoHandle }) {
 if(!demo.active) return null
 const demoSteps=demo.steps
 const step=demoSteps[demo.step]
 const totalDuration=demoSteps.reduce((total,item)=>total+(item.duration??9),0)
 return <section className="guided-demo" aria-label="Guided demonstration"><div className="demo-heading"><span>GUIDED WALKTHROUGH <b>{String(demo.step+1).padStart(2,'0')} / {String(demoSteps.length).padStart(2,'0')}</b></span><button title="Exit demo" aria-label="Exit demo" onClick={demo.exit}><X size={17}/></button></div>{demo.elapsed!==undefined&&<span className="demo-time">{Math.floor(demo.elapsed)} / {totalDuration} s {demo.paused?'· simulation paused':''}</span>}<div className="demo-track">{demoSteps.map((_,i)=><span className={i<=demo.step?'complete':''} key={i}/>)}</div><div aria-live="polite"><h3>{step.title}</h3><p>{step.body}</p></div><div className="demo-actions"><button onClick={demo.exit} aria-label="Exit walkthrough"><X size={14}/> Exit</button><button onClick={demo.togglePause}>{demo.paused?<Play size={14}/>:<Pause size={14}/>} {demo.paused?'Resume':'Pause'}</button><button onClick={demo.start}><RotateCcw size={14}/> Restart</button><button onClick={demo.next}>{demo.step===demoSteps.length-1?'Finish':'Next'}<ArrowRight size={14}/></button></div></section>
}
