import { useCallback, useEffect, useState } from 'react'
export const demoSteps = [
 { title: 'Meet the application', body: 'Explore the concept layout. This spatial blockout establishes the application workspace; the engineered machine is the next stage.', view: 'overview' as const },
 { title: 'Find the interface', body: 'The orange marker identifies the proposed sensor or transmission interface. Final mounting details will follow the engineering requirements.', view: 'sensor' as const },
 { title: 'Understand the feedback', body: 'Read the product’s measurement principle and its role in this machine. Live values will be derived from machine motion once that simulation is implemented.', view: 'sensor' as const },
 { title: 'Return to the whole machine', body: 'The foundation connects camera views, product context, and application navigation. You can now inspect the concept freely.', view: 'overview' as const },
]
export function useGuidedDemo() {
 const [generation,setGeneration] = useState(0)
 const [active, setActive] = useState(false), [paused,setPaused] = useState(false), [step,setStep] = useState(0)
 const start = useCallback(()=>{setGeneration(g=>g+1);setStep(0);setPaused(false);setActive(true)},[])
 const exit = useCallback(()=>{setActive(false);setPaused(false);setStep(0)},[])
 useEffect(()=>{if(!active||paused) return;const timer=window.setTimeout(()=>{if(step===demoSteps.length-1) exit();else setStep(s=>s+1)},9000);return()=>clearTimeout(timer)},[active,paused,step,exit,generation])
 return {active,paused,step,generation,steps:demoSteps,start,exit,togglePause:()=>setPaused(p=>!p), next:()=>{if(step===demoSteps.length-1)exit();else setStep(s=>s+1)}}
}
