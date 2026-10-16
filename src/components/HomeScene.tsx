import { useEffect, useMemo } from 'react'
import { SceneViewport } from './SceneViewport'
import { getApplication } from '../config/applications'
import { useCarousel } from '../carousel/useCarousel'
import { useConveyor } from '../conveyor/useConveyor'
import { useCrane } from '../crane/useCrane'
/** One scene at a time; the gallery uses the same models and controllers as the demos. */
export default function HomeScene({application}:{application:string}){
 const carousel=useCarousel(),conveyor=useConveyor(),crane=useCrane(),app=getApplication(application)!
 const camera=useMemo(()=>({view:'overview' as const,revision:0}),[application])
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  if(application==='carousel'&&!reduced){carousel.controller.setRPM(2);carousel.controller.start()}
  if(application==='conveyor'&&!reduced){conveyor.controller.setRPM(35);conveyor.controller.start()}
  return()=>{carousel.controller.stop();conveyor.controller.stop()}
 },[application,carousel.controller,conveyor.controller])
 return <div className="home-live-scene" aria-hidden="true"><SceneViewport app={app} selected={false} onSelect={()=>{}} camera={camera} grid={false} conveyor={app.machine==='conveyor'?conveyor.controller:undefined} conveyorSensor="wheel" crane={app.machine==='crane'?crane.controller:undefined} craneSensor="inclinometer" carousel={app.machine==='carousel'?carousel.controller:undefined} carouselConnected={carousel.snapshot.connected}/></div>
}
