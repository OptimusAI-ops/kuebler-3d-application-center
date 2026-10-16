import type { DemoStep } from '../state/demoTypes'
export const carouselDemoSteps:readonly DemoStep[]=[
 {title:'What keeps the magic connected?',body:'The platform rotates. The lights glow. Each horse rises and falls. The rotating equipment needs an electrical connection to the fixed supply.',view:'overview',duration:5},
 {title:'Two systems, one experience',body:'A motor on the fixed side drives platform rotation. Separate powered actuators and lights travel with the rotating platform.',view:'overview',duration:6},
 {title:'Find the rotation axis',body:'The slip ring sits on the central shaft extension. Its rotor is coupled to that shaft; the stator is restrained to the fixed support.',view:'overview',duration:4,selected:true},
 {title:'Inspect the installed slip ring',body:'A stationary torque stop prevents the stator from following the shaft. The output cable belongs entirely to the rotating equipment.',view:'sensor',duration:6,selected:true},
 {title:'Two sides of one interface',body:'The stator cable stays still. The rotor connection ring and its output cable rotate with the machine, without winding up the fixed supply.',view:'sensor',duration:6,selected:true},
 {title:'Power across sliding contacts',body:'The amber teaching overlay follows the input cable, brush contact, conductive ring and rotating output. The ring maintains a contact path around the full circumference.',view:'sensor',duration:6,selected:true},
 {title:'Control travels with the power',body:'The cyan path represents a control connection from the fixed side to rotating equipment. Power runs the loads; control determines their behavior.',view:'sensor',duration:6,selected:true},
 {title:'Open the contacts. See the consequence.',body:'With the contacts apart, the rotating circuit opens. The lights go out and the horse actuators stop. The separately powered base can keep turning.',view:'sensor',duration:7,selected:true},
 {title:'A direct cable has a limit',body:'Without the slip ring, a direct cable twists between fixed and rotating ends. This comparison stops at 90° from its neutral position, before excessive winding.',view:'sensor',duration:8,selected:true},
 {title:'Return to continuous transmission',body:'The lights return and the horses move again. Kübler makes continuous electrical connection visible: fixed supply, rotating loads, no winding cable.',view:'overview',duration:6},
]
export const carouselDemoBoundaries=carouselDemoSteps.reduce<number[]>((a,s)=>[...a,(a.at(-1)??0)+(s.duration??5)],[0])
export const CAROUSEL_DEMO_DURATION=carouselDemoBoundaries.at(-1)!
