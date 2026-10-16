import { SLIP_RING_OFFSET_Y } from '../carousel/electrical'
import { useEffect, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { MachineSceneProps } from './ConveyorScene'
import { buildCarouselMaterials } from './carousel/materials'
import { Carnival } from './carousel/Carnival'
import { SlipRing } from './carousel/SlipRing'
import { Workshop } from './conveyor/Workshop'

export function CarouselScene({carousel,selected=false,onSensorSelect,carouselPower=false,carouselSignal=false,carouselExploded=false,carouselCutaway=false,carouselComparison=null,carouselConnected=true}:MachineSceneProps){
 if(!carousel)throw new Error('Carousel requires its motion controller')
 const [serviceOpen,setServiceOpen]=useState(selected)
 const m=useMemo(()=>{const materials=buildCarouselMaterials();materials.floor.color.set('#46596a');return materials},[]),{invalidate}=useThree()
 useEffect(()=>carousel.subscribe(invalidate),[carousel,invalidate])
 useEffect(()=>{m.dim(carouselPower||carouselSignal||selected||carouselComparison!==null);invalidate()},[m,carouselPower,carouselSignal,selected,carouselComparison,invalidate])
 useEffect(()=>()=>m.dispose(),[m])
 useFrame(({camera},dt)=>{const open=selected||(camera.position.y<.9&&Math.hypot(camera.position.x,camera.position.z)<2.5);if(open!==serviceOpen)setServiceOpen(open);if(!document.hidden)carousel.tick(Math.min(dt,.05));if(carousel.active)invalidate()},-1)
 return <group><group scale={[1.35,1,1.35]}><Workshop materials={m}/></group>
  <Carnival controller={carousel} m={m} inspect={serviceOpen} connected={carouselConnected} power={carouselPower}/>
  <group position={[0,SLIP_RING_OFFSET_Y,0]}><SlipRing cutaway={carouselCutaway} controller={carousel} m={m} connected={carouselConnected} inspect={selected} power={carouselPower} signal={carouselSignal} exploded={carouselExploded} comparison={carouselComparison==='without'} onSelect={()=>onSensorSelect?.()}/></group>
 </group>
}
